import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Job from 'App/Models/Job'
import Quote from 'App/Models/Quote'
import Image from 'App/Models/Image'
import nodemailer from 'nodemailer'
import fs from 'fs'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

import mailConfig from '../../../config/mailConfig'

import TypesOfClothing from 'App/Assets/TypesOfClothing.json'

import Application from '@ioc:Adonis/Core/Application'

import path from 'path'

type StatusType = 'DRAFT' | 'PUBLISHED' | 'ASSINGNED' | 'SHIPPED' | 'FINISHED'

export default class JobsController {
  public async jobsByFilter({ request }: HttpContextContract) {
    const newFilterSchema = schema.create({
      type_of_clothing: schema.string.optional(),
      state: schema.string.optional(),
      postcode: schema.string.optional(),
    })

    const payload = await request.validate({ schema: newFilterSchema })

    const jobsWithQuotes = await Job.query()
      .preload('images')
      .preload('quotes')
      .preload('user')
      .where((query) => {
        if (payload.type_of_clothing && payload.type_of_clothing.toUpperCase() !== 'ALL') {
          query.where('type_of_clothing', payload.type_of_clothing)
        }

        if (payload.state && payload.state.toUpperCase() !== 'ALL') {
          query.whereHas('user', (subquery) => {
            subquery.where('state', payload.state as string)
          })
        }

        if (payload.postcode) {
          query.whereHas('user', (subquery) => {
            subquery.where('postcode', payload.postcode as string)
          })
        }
      })
      .whereNotIn('status', ['DRAFT'])
      .orderBy('created_at', 'desc')
      .exec()

    return jobsWithQuotes
  }

  public async index({ request, response }) {
    try {
      const jobs = await Job.query()
        .preload('images')
        .preload('quotes')
        .preload('user')
        .where((query) => {
          query.whereHas('user', (subquery) => {
            subquery.where('id', request.user.id)
          })
        })
        .orderBy('created_at', 'desc')
        .exec()
      return jobs
    } catch (error) {
      console.log(error)
      response.badRequest(error.messages)
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const newJobSchema = schema.create({
      type_of_clothing: schema.string([rules.maxLength(25)]),
      description: schema.string(),
      budget: schema.number.optional(),
      status: schema.string.optional({}, [rules.enum(['DRAFT', 'PUBLISHED'])]),
    })

    try {
      const payload = await request.validate({ schema: newJobSchema })
      const job = await Job.create({
        type_of_clothing: payload.type_of_clothing,
        description: payload.description,
        ...(payload.budget ? { budget: payload.budget } : {}),
        ...(payload.status ? { status: payload.status as StatusType } : {}),
        userId: request.user.id,
      })

      const images = request.input('images')

      if (images && Array.isArray(images))
        images.forEach(
          async (image) =>
            await Image.create({ path: `${request.user.id}_${image.path}`, jobId: job.id })
        )

      const jobCompleted = await Job.query().where('id', job.id).preload('images').first()

      return jobCompleted
    } catch (error) {
      console.log(error)
      response.badRequest(error.messages)
    }
  }

  public async publishJob({ request, response }: HttpContextContract) {
    const newJobSchema = schema.create({
      job_id: schema.number(),
    })

    try {
      const payload = await request.validate({ schema: newJobSchema })

      const job = await Job.find(payload.job_id)

      if (job !== null && job.status == 'DRAFT') {
        job.merge({ status: 'PUBLISHED' })
        await job.save()
      }

      return job
    } catch (error) {
      console.log(error)
      response.badRequest(error.messages)
    }
  }

  public async editJob({ request, response }: HttpContextContract) {
    const newJobSchema = schema.create({
      id: schema.number(),
      type_of_clothing: schema.string([rules.maxLength(25)]),
      description: schema.string(),
      budget: schema.number.optional(),
      status: schema.string.optional({}, [rules.enum(['DRAFT', 'PUBLISHED'])]),
    })

    try {
      const payload = await request.validate({ schema: newJobSchema })

      const job = await Job.find(payload.id)

      if (job !== null && job.status == 'DRAFT') {
        job.merge({
          type_of_clothing: payload.type_of_clothing,
          description: payload.description,
          ...(payload.budget ? { budget: payload.budget } : {}),
          ...(payload.status ? { status: payload.status as StatusType } : {}),
        })
        await job.save()

        // Update job images
        const currentImages = await job.related('images').query()
        const imageIds = request.input('images')?.map((image: any) => image.id) ?? []

        for (const image of currentImages) {
          if (!imageIds.includes(image.id)) {
            await image.delete()
          }
        }

        for (const imagePayload of request.input('images') ?? []) {
          if (!imagePayload.id) {
            // Create new image
            const image = await Image.create({
              path: `${request.user.id}_${imagePayload.path}`,
              jobId: job.id,
            })
            job.related('images').save(image)
          }
        }
      }

      return job
    } catch (error) {
      console.log(error)
      response.badRequest(error.messages)
    }
  }

  public async quote({ request, response }: HttpContextContract) {
    const newJobSchema = schema.create({
      quote: schema.string(),
      estimated_time: schema.number.optional(),
      comments: schema.string.optional(),
      job_id: schema.number(),
    })

    let quote: Quote | null = null
    let job: Job | null = null

    try {
      const payload = await request.validate({ schema: newJobSchema })
      job = await Job.query().preload('user').where('id', payload.job_id).firstOrFail()

      // 15% is added for the cost
      if (job !== null) {
        let quoteData = {
          jobId: job.id,
          comments: payload.comments,
          estimated_time: payload.estimated_time,
          userId: request.user.id,
          quote: parseFloat((parseFloat(payload.quote) * 1.15).toFixed(2)),
        }
        quote = await Quote.create(quoteData)
        return quote
      } else return 'unexpected_error'
    } catch (error) {
      console.log(error)
      response.badRequest(error.messages)
    } finally {
      if (quote && job) {
        this.sendEmail(
          job.user.name,
          job.user.lastname,
          job.user.email,
          TypesOfClothing[job.type_of_clothing],
          'https://acadeberiairunlionkrea.com/' + quote.id
        )
      }
    }
  }

  private sendEmail = (name, lastname, email, job, link) => {
    const transporter = nodemailer.createTransport(mailConfig)
    transporter.verify().then(console.log).catch(console.error)

    const pathEmailFile = path.join(__dirname, '../../../app/Assets/email.html')

    let html = fs.readFileSync(pathEmailFile, 'utf8')
    html = html.replace('{{NAME}}', name)
    html = html.replace('{{LASTNAME}}', lastname)
    html = html.replace('{{JOB}}', job)
    html = html.replace('{{LINK}}', link)

    transporter
      .sendMail({
        from: '"Test Meydit" <yamildiego91@gmail.com>',
        to: email,
        subject: 'MEYD.IT Iternship ✔',
        html: html,
      })
      .then((info) => {
        console.log({ info })
      })
      .catch(console.error)
  }

  public async uploadImages({ request }: HttpContextContract) {
    const files: any[] = request.files('images', {
      //@ts-ignore
      types: ['image'],
      size: '4mb',
    })

    const promises = files.map(async (file) => {
      await file.move(Application.publicPath('uploads'), {
        name: `${request.user.id}_${file.clientName}`,
      })
    })

    await Promise.all(promises)

    if (files.some((file) => !file.isValid)) {
      return files.filter((file) => !file.isValid).flatMap((file) => file.errors)
    }

    return { message: 'OK' }
  }
}

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Job from 'App/Models/Job'
import Quote from 'App/Models/Quote'
import nodemailer from 'nodemailer'
import fs from 'fs'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

import mailConfig from '../../../config/mailConfig'

import TypesOfClothing from 'App/Assets/TypesOfClothing.json'

export default class JobsController {
  public async jobsByFilter({ request }: HttpContextContract) {
    const newFilterSchema = schema.create({
      type_of_clothing: schema.string.optional(),
      state: schema.string.optional(),
      postcode: schema.string.optional(),
    })

    const payload = await request.validate({ schema: newFilterSchema })

    const jobsWithQuotes = await Job.query()
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
    const user = await User.find(request.user.id)
    try {
      let jobs: any[] = []
      if (user !== null) jobs = await user.related('jobs').query().orderBy('created_at', 'desc')
      return jobs
    } catch (error) {
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
      const job = await Job.create({ ...payload, userId: request.user.id })

      return job
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

      if (job.status == 'DRAFT') {
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

      if (job.status == 'DRAFT') {
        job.merge({ ...payload, budget: payload.budget ? payload.budget : null })
        await job.save()
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

    let quote = null
    let job = null

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

    let html = fs.readFileSync('App/Assets/email.html', 'utf8')
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
}

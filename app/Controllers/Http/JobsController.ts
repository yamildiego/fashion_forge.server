import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Job from 'App/Models/Job'
import Quote from 'App/Models/Quote'
import nodemailer from 'nodemailer'

import { schema, rules } from '@ioc:Adonis/Core/Validator'

import mailConfig from '../../../config/mailConfig'

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

  public async quote({ request, response }: HttpContextContract) {
    const newJobSchema = schema.create({
      quote: schema.number(),
      estimated_time: schema.number.optional(),
      comments: schema.string.optional(),
      job_id: schema.number(),
    })

    try {
      const payload = await request.validate({ schema: newJobSchema })
      const job = await Job.find(payload.job_id)

      // 15% is added for the cost
      if (job !== null) {
        let quoteData = {
          jobId: job.id,
          comments: payload.comments,
          estimated_time: payload.estimated_time,
          userId: request.user.id,
          quote: parseFloat((payload.quote * 1.15).toFixed(2)),
        }
        const quote = await Quote.create(quoteData)
        return quote
      } else return 'unexpected_error'
    } catch (error) {
      console.log(error)
      response.badRequest(error.messages)
    }
  }

  public async send({}: HttpContextContract) {
    const transporter = nodemailer.createTransport(mailConfig)
    transporter.verify().then(console.log).catch(console.error)

    console.log("mailConfig")
    console.log(mailConfig)

    transporter
      .sendMail({
        from: '"Test Meydit" <yamildiego91@gmail.com>', // sender address
        to: 'yamildiego@gmail.com', // list of receivers
        subject: 'Meyd.it Iternship ✔', // Subject line
        text: "There is a new article. It's about sending emails, check it out!", // plain text body
        html: "<b>There is a new article. It's about sending emails, check it out!</b>", // html body
      })
      .then((info) => {
        console.log({ info })
      })
      .catch(console.error)

    return { message: 'El correo electrónico ha sido enviado correctamente.' }
  }
}

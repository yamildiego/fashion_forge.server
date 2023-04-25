import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Job from 'App/Models/Job'
import Quote from 'App/Models/Quote'

import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class JobsController {
  public async getJobsByFilter({ request, response, session }: HttpContextContract) {
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
            subquery.where('state', payload.state)
          })
        }

        if (payload.postcode) {
          query.whereHas('user', (subquery) => {
            subquery.where('postcode', payload.postcode)
          })
        }
      })
      .orderBy('created_at', 'desc')
      .exec()

    return jobsWithQuotes
  }

  public async index({ session }) {
    const user = await User.find(session.get('userId'))
    let jobs: any[] = []
    if (user !== null) jobs = await user.related('jobs').query().orderBy('created_at', 'desc')
    return jobs
  }

  public async store({ request, response, session }: HttpContextContract) {
    const newJobSchema = schema.create({
      type_of_clothing: schema.string([rules.maxLength(25)]),
      description: schema.string(),
      budget: schema.number.optional(),
    })

    try {
      const payload = await request.validate({ schema: newJobSchema })
      const job = await Job.create({ ...payload, userId: session.get('userId') })

      return job
    } catch (error) {
      console.log(error)
      response.badRequest(error.messages)
    }
  }

  public async quote({ request, response, session }: HttpContextContract) {
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
          userId: session.get('userId'),
          quote: (parseInt(payload.quote) * 1.15).toFixed(2),
        }
        const quote = await Quote.create(quoteData)
        return quote
      }
      //TODO: else return unexpected error
    } catch (error) {
      console.log(error)
      response.badRequest(error.messages)
    }
  }
}

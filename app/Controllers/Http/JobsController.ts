import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Job from 'App/Models/Job'
import Quote from 'App/Models/Quote'

import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class JobsController {
  public async getAllJobs() {
    const jobsWithQuotes = await Job.query().preload('quotes').exec()
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
          userId: session.get('userId'),
          quote: payload.quote * 1.15,
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

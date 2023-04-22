import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from 'App/Models/User'
import Job from 'App/Models/Job'
import Quote from 'App/Models/Quote'

import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class JobsController {
  public async getAllJobs() {
    const jobs = await Job.query().preload('user').exec()
    return jobs
  }

  public async index({ session }) {
    const user = await User.find(session.get('userId'))
    const jobs = await user.related('jobs').query().orderBy('created_at', 'desc')
    return jobs
  }

  public async store({ request, response, session }: HttpContextContract) {
    const newJobSchema = schema.create({
      type_of_clothing: schema.string(),
      description: schema.string(),
      budget: schema.number.optional(),
    })

    try {
      const payload = await request.validate({ schema: newJobSchema })
      const data = request.only(['type_of_clothing', 'description', 'budget'])
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

      let q = { jobId: job.id, userId: session.get('userId'), quote: payload.quote }

      const quote = await Quote.create(q)

      return quote
    } catch (error) {
      console.log(error)
      response.badRequest(error.messages)
    }
  }
}

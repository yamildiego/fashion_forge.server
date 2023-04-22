import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Client from 'App/Models/Client'
import Job from 'App/Models/Job'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class JobsController {
  public async getAllJobs() {
    const jobs = await Job.query().preload('client').exec()
    return jobs
  }

  public async index({ session }) {
    const client = await Client.find(session.get('client'))
    const jobs = await client.related('jobs').query().orderBy('created_at', 'desc')
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
      const client = session.get('client')

      console.log(data)

      data['clientId'] = client
      data['budget'] = data['budget'] === '' ? null : data['budget']

      const job = await Job.create(data)

      return job
    } catch (error) {
      console.log(error)
      response.badRequest(error.messages)
    }
  }
}

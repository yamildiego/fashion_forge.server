import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Client from 'App/Models/Client'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class ClientsController {
  public async index() {
    const clients = await Client.all()
    return clients
  }

  public async show({ params, request, response }: HttpContextContract) {
    const client = await Client.find(params.id)
    return client
  }

  public async store({ request, response, session }: HttpContextContract) {
    const newClientSchema = schema.create({
      name: schema.string(),
      lastname: schema.string(),
      phone: schema.string(),
      email: schema.string([rules.email(), rules.unique({ table: 'clients', column: 'email' })]),
      address: schema.string(),
      state: schema.string(),
      postcode: schema.string(),
    })

    try {
      const payload = await request.validate({ schema: newClientSchema })
      const data = request.only([
        'name',
        'lastname',
        'phone',
        'email',
        'address',
        'state',
        'postcode',
      ])

      const client = await Client.create(data)

      session.put('client', client.id)

      return client
    } catch (error) {
      console.log(error)
      response.badRequest(error.messages)
    }
  }

  public async getCreatedClient({ request, response, session }: HttpContextContract) {
    const newClientSchema = schema.create({
      email: schema.string([rules.email(), rules.exists({ table: 'clients', column: 'email' })]),
    })

    try {
      const payload = await request.validate({ schema: newClientSchema })
      const data = request.only(['email'])

      const client = await Client.findBy('email', data.email)

      session.put('client', client.id)

      return client
    } catch (error) {
      console.log(error)
      response.badRequest(error.messages)
    }
  }

  //   public async update({ params, request }: HttpContextContract) {
  //     const client = await Client.find(params.id)
  //     const data = request.only(['nombre', 'email', 'contrasena'])
  //     client.merge(data)
  //     await client.save()
  //     return client
  //   }

  public async delete({ params }: HttpContextContract) {
    const client = await Client.find(params.id)
    await client.delete()
    return { message: 'Client eliminado correctamente' }
  }
}

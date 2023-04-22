import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from 'App/Models/User'

import { schema, rules } from '@ioc:Adonis/Core/Validator'

import { validator } from '@ioc:Adonis/Core/Validator'
import UniqueCombination from 'App/Validators/uniqueCombination'
import ExistsUser from 'App/Validators/ExistsUser'
import Database from '@ioc:Adonis/Lucid/Database'

export default class UsersController {
  public async store({ request, response, session }: HttpContextContract) {
    validator.rule(
      'uniqueCombination',
      async (value: any, args: any, ctx: HttpContextContract) => {
        const isValid = await new UniqueCombination(Database).validate(
          { user_type: value, email: ctx.root.email },
          args
        )
        if (!isValid)
          ctx.errorReporter.report('uniqueCombination', 'uniqueCombination validation failed')
      },
      () => {
        return { async: true, compiledOptions: { column: ['email', 'user_type'], table: 'users' } }
      }
    )

    const newUserSchema = schema.create({
      name: schema.string(),
      lastname: schema.string(),
      phone: schema.string(),
      user_type: schema.string([rules.enum(['CLIENT', 'MAKER']), rules.uniqueCombination()]),
      email: schema.string([rules.email()]),
      address: schema.string(),
      state: schema.string(),
      postcode: schema.string(),
    })

    try {
      const payload = await request.validate({ schema: newUserSchema })
      const user = await User.create(payload)

      session.put('userId', user.id)

      return user
    } catch (error) {
      console.log(error)
      response.badRequest(error.messages)
    }
  }

  public async getCreatedUser({ request, response, session }: HttpContextContract) {
    validator.rule(
      'existsUser',
      async (value: any, args: any, ctx: HttpContextContract) => {
        const isValid = await new ExistsUser(Database).validate(
          { user_type: value, email: ctx.root.email },
          args
        )
        if (!isValid) ctx.errorReporter.report('existsUser', 'existsUser validation failed')
      },
      () => {
        return { async: true, compiledOptions: { column: ['email', 'user_type'], table: 'users' } }
      }
    )

    const userSchema = schema.create({
      email: schema.string([rules.email()]),
      user_type: schema.string([rules.enum(['CLIENT', 'MAKER']), rules.existsUser()]),
    })

    try {
      const payload = await request.validate({ schema: userSchema })
      const user = await User.findBy('email', payload.email, 'user_type', payload.user_type)

      session.put('userId', user.id)

      return user
    } catch (error) {
      console.log(error)
      response.badRequest(error.messages)
    }
  }
}

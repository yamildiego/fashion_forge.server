import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from 'App/Models/User'

import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import { validator } from '@ioc:Adonis/Core/Validator'
import UniqueCombination from 'App/Validators/UniqueCombination'

import ExistsUser from 'App/Validators/ExistsUser'

import { UserType } from '../../Enums/UserType'

export default class UsersController {
  public async store({ request, response, session }: HttpContextContract) {
    validator.rule(
      'uniqueCombination',
      async (value: any, args: any, ctx: any) => {
        const isValid = await new UniqueCombination(Database).validate(
          { user_type: value, email: ctx.root.email },
          args
        )
        if (!isValid) ctx.errorReporter.report('email', 'unique')
      },
      () => {
        return { async: true, compiledOptions: { column: ['email', 'user_type'], table: 'users' } }
      }
    )

    const data = request.only(['user_type'])
    const newUserSchema = schema.create({
      ...(data.user_type == 'MAKER'
        ? {
            business_name: schema.string([rules.maxLength(100)]),
            name: schema.string.optional(),
            lastname: schema.string.optional(),
            address: schema.string.optional(),
            state: schema.string.optional(),
            postcode: schema.string.optional(),
          }
        : {
            business_name: schema.string.optional(),
            name: schema.string([rules.maxLength(100)]),
            lastname: schema.string([rules.maxLength(100)]),
            address: schema.string([rules.maxLength(250)]),
            state: schema.string([rules.maxLength(25)]),
            postcode: schema.string([rules.maxLength(10)]),
          }),
      phone: schema.string([rules.maxLength(20)]),
      user_type: schema.string({}, [rules.enum(['CLIENT', 'MAKER']), rules.uniqueCombination()]),
      email: schema.string([rules.email(), rules.maxLength(200)]),
    })

    try {
      const payload = await request.validate({ schema: newUserSchema })

      const user = await User.create({ ...payload, user_type: payload.user_type as UserType })

      if (user !== null) session.put('userId', user.id)

      return user
    } catch (error) {
      console.log(error)
      response.badRequest(error.messages)
    }
  }

  public async signInUser({ request, response, session }: HttpContextContract) {
    validator.rule(
      'existsUser',
      async (value: any, args: any, ctx: any) => {
        const isValid = await new ExistsUser(Database).validate(
          { user_type: value, email: ctx.root.email },
          args
        )
        if (!isValid) ctx.errorReporter.report('email', 'existsUser')
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
      const user = await User.query()
        .where('email', payload.email)
        .andWhere('user_type', payload.user_type)
        .first()

      if (user !== null) session.put('userId', user.id)

      return user
    } catch (error) {
      console.log(error)
      response.badRequest(error.messages)
    }
  }
}

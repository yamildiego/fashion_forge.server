import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

import { UserType } from '../../Enums/UserType'

import User from 'App/Models/User'
import md5 from 'crypto-js/md5'

import 'App/Rules/uniqueCombination'
import 'App/Rules/existsUser'
import 'App/Rules/matchPassword'

export default class UsersController {
  public async store({ request, response, session }: HttpContextContract) {
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
      password: schema.string([rules.minLength(8)]),
      confirm_password: schema.string.optional([rules.matchPassword()]),
      user_type: schema.string({}, [rules.enum(['CLIENT', 'MAKER']), rules.uniqueCombination()]),
      email: schema.string([rules.email(), rules.maxLength(200)]),
    })

    try {
      const payload = await request.validate({ schema: newUserSchema })

      delete payload.confirm_password

      const user = await User.create({
        ...payload,
        password: md5(payload.password),
        user_type: payload.user_type as UserType,
      })

      if (user !== null) session.put('userId', user.id)

      let userData = user.toJSON()

      delete userData.password
      return userData
    } catch (error) {
      console.log(error)
      response.badRequest(error.messages)
    }
  }

  public async signInUser({ request, response, session }: HttpContextContract) {
    const userSchema = schema.create({
      email: schema.string([rules.email()]),
      password: schema.string(),
      user_type: schema.string([rules.enum(['CLIENT', 'MAKER']), rules.existsUser()]),
    })

    try {
      const payload = await request.validate({ schema: userSchema })
      const user = await User.query()
        .where('email', payload.email)
        .andWhere('user_type', payload.user_type)
        .andWhere('password', md5(payload.password))
        .first()

      if (user !== null) {
        var userData = user.toJSON()
        delete userData.password
        session.put('userId', user.id)
        return userData
      }
    } catch (error) {
      console.log(error)
      response.badRequest(error.messages)
    }
  }

  public async signOutUser({ session }: HttpContextContract) {
    await session.clear()
    return 'OK'
  }

  public async getCurrentUser({ request }: HttpContextContract) {
    return request.user
  }
}

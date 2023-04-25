import Database from '@ioc:Adonis/Lucid/Database'
import { validator } from '@ioc:Adonis/Core/Validator'
import ExistsUser from 'App/Validators/ExistsUser'
import md5 from 'crypto-js/md5'

const userTypes = ['CLIENT', 'MAKER']

validator.rule(
  'existsUser',
  async (value: any, args: any, ctx: any) => {
    const userTypeIsValid = userTypes.includes(value)
    if (userTypeIsValid) {
      const isValid = await new ExistsUser(Database).validate(
        { user_type: value, email: ctx.root.email, password: md5(ctx.root.password) },
        args
      )
      if (!isValid) ctx.errorReporter.report('password', 'wrongData')
    }
  },
  () => {
    return {
      async: true,
      compiledOptions: { column: ['email', 'user_type', 'password'], table: 'users' },
    }
  }
)

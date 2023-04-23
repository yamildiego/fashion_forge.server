import Database from '@ioc:Adonis/Lucid/Database'
import { validator } from '@ioc:Adonis/Core/Validator'
import ExistsUser from 'App/Validators/ExistsUser'

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

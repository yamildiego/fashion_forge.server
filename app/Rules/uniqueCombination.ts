import Database from '@ioc:Adonis/Lucid/Database'
import { validator } from '@ioc:Adonis/Core/Validator'
import UniqueCombination from 'App/Validators/UniqueCombination'

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

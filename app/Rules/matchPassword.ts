import Database from '@ioc:Adonis/Lucid/Database'
import { validator } from '@ioc:Adonis/Core/Validator'
validator.rule('matchPassword', (value: any, args: any, ctx: any) => {
  const isValid = value === ctx.root.password
  if (!isValid) ctx.errorReporter.report('password', 'matchPassword')
})

import { validator } from '@ioc:Adonis/Core/Validator'
// @ts-ignore
validator.rule('matchPassword', (value: any, args: any, ctx: any) => {
  const isValid = value === ctx.root.password
  if (!isValid) ctx.errorReporter.report('password', 'matchPassword')
})

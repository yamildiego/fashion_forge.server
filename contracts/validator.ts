declare module '@ioc:Adonis/Core/Validator' {
  interface Rules {
    uniqueCombination(): Rule
    existsUser(): Rule
    enum(value: any): Rule
  }
}

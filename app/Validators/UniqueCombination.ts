// @ts-ignore
import { ValidationRuleContract } from '@ioc:Adonis/Core/Validator'
import { DatabaseContract } from '@ioc:Adonis/Lucid/Database'

import User from 'App/Models/User'

export default class UniqueCombination implements ValidationRuleContract {
  constructor(protected db: DatabaseContract) {}

  public compile(args: any[]) {
    const fieldNames = args['column']
    return [fieldNames]
  }

  public async validate(values: { [key: string]: string }, args: any[]) {
    const isCreated: number = await this.getIsAlreadyCreated(args, values)
    return isCreated == 0
  }

  protected async getIsAlreadyCreated(
    args: any[],
    values: { [key: string]: string }
  ): Promise<number> {
    const [fieldNames] = this.compile(args)

    const query = User.query()

    query.where(fieldNames[0], values[fieldNames[0]])
    query.andWhere(fieldNames[1], values[fieldNames[1]])

    const count = await query.count('*')

    return count[0].$extras.count
  }
}

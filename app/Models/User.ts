import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'

import Job from './Job'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public business_name: string | null

  @column()
  public name: string | null

  @column()
  public lastname: string | null

  @column()
  public phone: string

  @column({
    serialize: (value: string | null) => (value ? value.toUpperCase() : null),
  })
  public user_type: 'CLIENT' | 'MAKER'

  @column()
  public email: string

  @column()
  public password: string

  @column()
  public address: string | null

  @column()
  public state: string | null

  @column()
  public postcode: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Job, {
    foreignKey: 'userId',
  })
  public jobs: HasMany<typeof Job>
}

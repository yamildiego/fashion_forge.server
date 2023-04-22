import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'

import Job from './Job'

export default class Client extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public lastname: string

  @column()
  public phone: string

  @column()
  public email: string

  @column()
  public address: string

  @column()
  public state: string

  @column()
  public postcode: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Job, {
    foreignKey: 'clientId',
  })
  public jobs: HasMany<typeof Job>
}

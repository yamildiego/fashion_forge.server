import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public lastname: string

  @column()
  public phone: string

  @column({
    serialize: (value: string | null) => (value ? value.toUpperCase() : null),
  })
  public user_type: 'CLIENT' | 'MAKER'

  @column()
  public email: string

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
}

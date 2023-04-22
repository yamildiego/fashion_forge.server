import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.string('lastname').notNullable()
      table.string('phone').notNullable()
      table.enum('user_type', ['CLIENT', 'MAKER']).notNullable()
      table.string('email').notNullable()
      table.string('address').nullable()
      table.string('state').nullable()
      table.string('postcode').nullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      table.unique(['email', 'user_type'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

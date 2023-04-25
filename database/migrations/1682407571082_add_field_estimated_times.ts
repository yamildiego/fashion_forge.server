import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'quotes'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('estimated_time').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('estimated_time')
    })
  }
}

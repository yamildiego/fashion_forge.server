/*
  |--------------------------------------------------------------------------
  | Routes
  |--------------------------------------------------------------------------
  |
  | This file is dedicated for defining HTTP routes. A single file is enough
  | for majority of projects, however you can define routes in different
  | files and just make sure to import them inside this file. For example
  |
  | Define routes in following two files
  | ├── start/routes/cart.ts
  | ├── start/routes/customer.ts
  |
  | and then import them inside `start/routes.ts` as follows
  |
  | import './routes/cart'
  | import './routes/customer'
  |
  */

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async ({}) => {
  return {
    status: `OK ${new Date().toLocaleDateString()}`,
  }
})

Route.post('/user', 'UsersController.store')
Route.post('/user/signInUser', 'UsersController.signInUser')

// Route.post('/client/getCreatedClient', 'ClientsController.getCreatedClient')

Route.post('/job', 'JobsController.store')
Route.post('/job/quote', 'JobsController.quote')
Route.get('/jobs', 'JobsController.index')
Route.get('/getAllJobs', 'JobsController.getAllJobs')

// Route.post('/job/upload', 'JobsController.upload')
// Route.get('/client/:id', 'ClientsController.show')
// Route.put('/client/:id', 'ClientsController.update')
// Route.delete('/client/:id', 'ClientsController.delete')

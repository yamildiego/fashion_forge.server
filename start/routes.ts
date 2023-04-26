import Route from '@ioc:Adonis/Core/Route'
import AuthMiddleware from 'App/Middleware/AuthMiddleware'

Route.get('/', async ({}) => {
  return {
    status: `OK ${new Date().toLocaleDateString()}`,
  }
})

Route.post('/user', 'UsersController.store')
Route.post('/user/signInUser', 'UsersController.signInUser')
Route.post('/job', 'JobsController.store').middleware(AuthMiddleware)
Route.get('/jobs', 'JobsController.index').middleware(AuthMiddleware)
Route.post('/jobsByFilter', 'JobsController.jobsByFilter').middleware(AuthMiddleware)
Route.post('/newQuote', 'JobsController.quote').middleware(AuthMiddleware)
Route.get('/send', 'JobsController.send')

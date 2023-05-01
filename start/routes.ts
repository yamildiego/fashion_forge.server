import Route from '@ioc:Adonis/Core/Route'
import AuthMiddleware from 'App/Middleware/AuthMiddleware'

Route.get('/', async ({}) => {
  return {
    status: `OK ${new Date().toLocaleDateString()}`,
  }
})

Route.post('/user', 'UsersController.store')
Route.get('/user', 'UsersController.getCurrentUser').middleware(AuthMiddleware)
Route.post('/user/signInUser', 'UsersController.signInUser')
Route.post('/user/signOutUser', 'UsersController.signOutUser')

Route.get('/job/:id', 'JobsController.getJobById').middleware(AuthMiddleware)
Route.post('/job', 'JobsController.store').middleware(AuthMiddleware)
Route.post('/job/publishJob', 'JobsController.publishJob').middleware(AuthMiddleware)
Route.post('/job/editJob', 'JobsController.editJob').middleware(AuthMiddleware)
Route.get('/jobs', 'JobsController.index').middleware(AuthMiddleware)
Route.post('/jobsByFilter', 'JobsController.jobsByFilter').middleware(AuthMiddleware)
Route.post('/newQuote', 'JobsController.quote').middleware(AuthMiddleware)

Route.post('/job/uploadImages', 'JobsController.uploadImages').middleware(AuthMiddleware)

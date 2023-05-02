import Route from '@ioc:Adonis/Core/Route'
import AuthMiddleware from 'App/Middleware/AuthMiddleware'
import CheckJobByGetMiddleware from 'App/Middleware/CheckJobByGetMiddleware'
import CheckJobByPostMiddleware from 'App/Middleware/CheckJobByPostMiddleware'

Route.get('/', async ({}) => {
  return {
    status: `OK ${new Date().toLocaleDateString()}`,
  }
})

Route.post('/user', 'UsersController.store')
Route.get('/user', 'UsersController.getCurrentUser').middleware(AuthMiddleware)
Route.post('/user/signInUser', 'UsersController.signInUser')
Route.post('/user/signOutUser', 'UsersController.signOutUser')

Route.get('/job/:id', 'JobsController.getJobById').middleware([
  AuthMiddleware,
  CheckJobByGetMiddleware,
])
Route.post('/job', 'JobsController.store').middleware(AuthMiddleware)
Route.get('/job/publishJob/:id', 'JobsController.publishJob').middleware([
  AuthMiddleware,
  CheckJobByGetMiddleware,
])
Route.post('/job/editJob', 'JobsController.editJob').middleware([
  AuthMiddleware,
  CheckJobByPostMiddleware,
])
Route.get('/jobs', 'JobsController.index').middleware(AuthMiddleware)
Route.post('/jobsByFilter', 'JobsController.jobsByFilter').middleware(AuthMiddleware)
Route.post('/newQuote', 'JobsController.quote').middleware([
  AuthMiddleware,
  CheckJobByPostMiddleware,
])

Route.post('/job/uploadImages', 'JobsController.uploadImages').middleware(AuthMiddleware)

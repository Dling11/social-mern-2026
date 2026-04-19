import { Router } from 'express'
import { adminController } from '../controllers/admin.controller'
import { requireAdmin } from '../middleware/admin.middleware'
import { requireAuth } from '../middleware/auth.middleware'

export const adminRouter = Router()

adminRouter.use(requireAuth, requireAdmin)
adminRouter.get('/stats', adminController.getStats)
adminRouter.get('/users', adminController.getUsers)
adminRouter.get('/posts', adminController.getPosts)
adminRouter.patch('/users/:userId/role', adminController.updateUserRole)
adminRouter.delete('/posts/:postId', adminController.deletePost)

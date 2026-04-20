import bcrypt from 'bcryptjs'
import { env } from '../config/env'
import { UserModel } from '../models/user.model'

export const bootstrapService = {
  async ensureAdminUser() {
    if (!env.ENABLE_ADMIN_BOOTSTRAP || env.NODE_ENV === 'production') {
      return
    }

    if (!env.ADMIN_BOOTSTRAP_EMAIL || !env.ADMIN_BOOTSTRAP_PASSWORD) {
      return
    }

    const email = env.ADMIN_BOOTSTRAP_EMAIL.toLowerCase()
    const existingUser = await UserModel.findOne({ email })

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(env.ADMIN_BOOTSTRAP_PASSWORD, 12)
      await UserModel.create({
        name: 'Admin',
        firstName: 'Admin',
        lastName: 'User',
        middleName: null,
        username: 'admin',
        email,
        password: hashedPassword,
        role: 'admin',
      })
      return
    }

    if (existingUser.role !== 'admin') {
      existingUser.role = 'admin'
      await existingUser.save()
    }
  },
}

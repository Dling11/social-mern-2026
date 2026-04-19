import { createServer } from 'node:http'
import { createApp } from './app'
import { connectDatabase } from './config/database'
import { env } from './config/env'
import { bootstrapService } from './services/bootstrap.service'
import { initSocket } from './socket'

async function bootstrap() {
  await connectDatabase()
  await bootstrapService.ensureAdminUser()

  const app = createApp()
  const server = createServer(app)
  initSocket(server)

  server.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`)
  })
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error)
  process.exit(1)
})

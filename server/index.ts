import { env } from './config/env'
import { createApp } from './app'

const bootstrap = async () => {
  const app = await createApp()
  app.listen(env.PORT, () => {
    console.log(`API server running on http://localhost:${env.PORT}`)
  })
}

bootstrap().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
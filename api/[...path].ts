import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Express } from 'express'
import { createApp } from '../server/app'

let appPromise: Promise<Express> | undefined

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  appPromise ??= createApp()
  const app = await appPromise

  return app(request, response)
}

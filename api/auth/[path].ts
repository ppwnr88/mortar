import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleApi } from '../_handler.js'

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  return handleApi(request, response)
}

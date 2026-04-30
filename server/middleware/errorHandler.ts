import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

export const errorHandler = (
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) => {
  if (error instanceof ZodError) {
    response.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง', issues: error.issues })
    return
  }

  if (error instanceof Error) {
    response.status(400).json({ message: error.message })
    return
  }

  response.status(500).json({ message: 'Unexpected server error' })
}
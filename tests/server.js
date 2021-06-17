import { Router } from 'express'

const router = Router()

router.post("/stringified_body", (request, response) => {
  const status = 200
  if (request.body === '[object Object]') {
    status = 400
  }

  response.sendStatus(status)
})

export const TestServer = router
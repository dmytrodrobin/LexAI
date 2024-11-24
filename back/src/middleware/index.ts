import { getUserByToken } from "repositories/user"
import express from "express"
import { merge } from "lodash"
import { Constants } from "common/constants"
export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const data = JSON.parse(req.cookies[Constants.AuthTokenName])

    if (!data.sessionToken) {
      res.sendStatus(403)
      return
    }

    const user = await getUserByToken(data.sessionToken)

    if (!user) {
      res.sendStatus(403)
      return
    }

    merge(req, { identity: user })

    next()
  } catch (error) {
    console.log(error)
    res.sendStatus(400)
  }
}

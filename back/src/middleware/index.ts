import express from "express"
import { get, merge } from "lodash"
import { Constants } from "../common/constants"
import { checkUserConversation, getUserByToken } from "../repositories/user"

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
export const isOwner = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const curUserId = get(req, "identity._id") as string
    const { conversationId } = req.body || req.params

    if (conversationId) {
      const isOwner = await checkUserConversation(curUserId, conversationId)
      console.log(isOwner)
      if (!isOwner) {
        res.sendStatus(403)
        return
      }
    }

    next()
  } catch (error) {
    console.log(error)
    res.sendStatus(400)
  }
}

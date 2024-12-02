import express from "express"
import {
  createUser,
  getUserByEmail,
  getUserById,
  getUserWithConversationsByToken,
} from "../repositories/user"
import { random, auth } from "../helpers"
import { Constants } from "../common/constants"

export async function login(req: express.Request, res: express.Response) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.sendStatus(400)
      return
    }

    const user = await getUserByEmail(email).select("+auth.salt +auth.password")

    if (!user) {
      res.sendStatus(400)
      return
    }

    const expectedHash = auth(user.auth.salt, password)

    if (user.auth.password !== expectedHash) {
      res.sendStatus(403)
      return
    }

    const salt = random()
    user.auth.sessionToken = auth(salt, user._id.toString())

    await user.save()
    const cookieData = { sessionToken: user.auth.sessionToken }
    res.cookie(Constants.AuthTokenName, JSON.stringify(cookieData), {
      httpOnly: true,
    })
    console.log(user)
    const result = await getUserById(user._id)
    res.status(200).json(result).end()
  } catch (e) {
    console.error(e)
    res.sendStatus(400)
  }
}
export async function register(req: express.Request, res: express.Response) {
  try {
    const { email, password, username } = req.body

    if (!email || !password || !username) {
      res.sendStatus(400)
      return
    }

    const user = await getUserByEmail(email)

    if (user) {
      res.sendStatus(400)
      return
    }

    const salt = random()
    const newUser = await createUser({
      email,
      username,
      auth: {
        salt,
        password: auth(salt, password),
      },
    })

    res.status(200).json(newUser).end()
  } catch (e) {
    console.error(e)
    res.sendStatus(400)
  }
}
export async function me(req: express.Request, res: express.Response) {
  try {
    const data = JSON.parse(req.cookies[Constants.AuthTokenName])

    if (!data.sessionToken) {
      res.sendStatus(403)
      return
    }

    const user = await getUserWithConversationsByToken(data.sessionToken)

    if (!user) {
      res.sendStatus(404)
      return
    }

    res.status(200).json(user).end()
  } catch (e) {
    console.error(e)
    res.sendStatus(400)
  }
}

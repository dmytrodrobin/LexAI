import express from "express"
import {
  addConversationMessage,
  createConversation,
  getConversationById,
} from "../repositories/conversation"
import { createMessage } from "../repositories/message"
import { addUserConversation } from "repositories/user"
import { get } from "lodash"

export async function sendConversationRequest(
  req: express.Request,
  res: express.Response
) {
  try {
    const { conversationId, text } = req.body
    let conversation

    if (conversationId) {
      conversation = await getConversationById(conversationId)

      if (!conversation) {
        res.status(400)
        return
      }
    } else {
      conversation = await createConversation()
      const curUserId = get(req, "identity._id") as string

      await addUserConversation(curUserId, conversation._id)
    }

    const reqMsg = await createMessage(text, "request")

    await addConversationMessage(conversation._id, reqMsg._id)

    /// api call to rag

    const resMsg = await createMessage(text, "response")

    const result = await addConversationMessage(conversation._id, resMsg._id)

    res.status(200).json(result)
  } catch (e) {
    console.error(e)
    res.sendStatus(400)
  }
}

export async function getConversation(
  req: express.Request,
  res: express.Response
) {
  try {
    const { conversationId } = req.params

    if (!conversationId) {
      res.status(400)
      return
    }

    const conversation = await getConversationById(conversationId)

    if (!conversation) {
      res.status(400)
      return
    }

    res.status(200).json(conversation)
  } catch (e) {
    console.error(e)
    res.sendStatus(400)
  }
}

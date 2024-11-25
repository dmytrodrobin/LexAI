import express from "express"
import {
  getConversation,
  sendConversationRequest,
} from "../controllers/conversation"
import { isAuthenticated, isOwner } from "../middleware"

export default (router: express.Router) => {
  router.post(
    "/conversation",
    isAuthenticated,
    isOwner,
    sendConversationRequest
  )
  router.get(
    "/conversation/:conversationId",
    isAuthenticated,
    isOwner,
    getConversation
  )
}

import express from "express"
import {
  getConversation,
  sendConversationRequest,
} from "../controllers/conversation"
import { isAuthenticated } from "../middleware"

export default (router: express.Router) => {
  router.post("/conversation", isAuthenticated, sendConversationRequest)
  router.get("/conversation/:conversationId", getConversation)
}

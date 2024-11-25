import mongoose from "mongoose"

export const MessageSchema = new mongoose.Schema({
  type: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

export const MessageModel = mongoose.model("message", MessageSchema)

export const createMessage = (text: string, type: "request" | "response") =>
  new MessageModel({ text, type }).save()

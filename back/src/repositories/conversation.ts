import mongoose, { Types } from "mongoose"

const ConversationSchema = new mongoose.Schema({
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "message" }],
})

export const ConversationModel = mongoose.model(
  "conversation",
  ConversationSchema
)

export const getConversationById = (id: string) =>
  ConversationModel.findById(id)
    .populate({
      path: "messages",
      options: { sort: { createdAt: "desc" } },
    })
    .then((conversation) => conversation.toObject())

export const createConversation = () => new ConversationModel().save()

export const addConversationMessage = (
  conversationId: Types.ObjectId,
  messageId: Types.ObjectId
) =>
  ConversationModel.findByIdAndUpdate(conversationId, {
    $push: {
      messages: messageId,
    },
  })
    .exec()
    .then((conversation) =>
      ConversationModel.findById(conversation._id)
        .populate({
          path: "messages",
          options: { sort: { createdAt: "desc" }, limit: 1 },
        })
        .then((conversation) => conversation.toObject())
    )

import mongoose, { Types } from "mongoose"

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  auth: {
    password: { type: String, required: true, select: false },
    salt: { type: String, select: false },
    sessionToken: { type: String, select: false },
  },
  conversations: [
    { type: mongoose.Schema.Types.ObjectId, ref: "conversation" },
  ],
})

export const UserModel = mongoose.model("User", UserSchema)

export const getUserByEmail = (email: string) => UserModel.findOne({ email })
export const getUserByToken = (sessionToken: string) =>
  UserModel.findOne({
    "auth.sessionToken": sessionToken,
  })
export const getUserById = (id: string) => UserModel.findById(id)
export const createUser = (values: Record<string, any>) =>
  new UserModel(values).save().then((user) => user.toObject())
export const getUserConversations = (id: string) =>
  UserModel.findById(id).populate("conversations")
export const addUserConversation = (
  userId: string,
  conversationId: Types.ObjectId
) =>
  UserModel.findByIdAndUpdate(userId, {
    $push: { conversations: conversationId },
  })

type Message = {
  _id: string
  type: string
  text: string
  createdAt: Date
  updatedAt: Date
}

type Conversation = {
  _id: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

type User = {
  email: string
  username: string
  conversations: Conversation[]
}

type AuthContextType = {
  currentUser: User | null
  login: (email: string, password: string) => Promise<any>
  register: (email: string, username: string, password: string) => Promise<any>
  logout: () => void
  refresh: () => Promise<void>
}

export type { User, Conversation, Message, AuthContextType }

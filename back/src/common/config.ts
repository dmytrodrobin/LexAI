import dotenv from "dotenv"
dotenv.config()

const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  host: process.env.PORT || 'localhost',
  db: process.env.MONGO_URL || "",
  secret: process.env.SECRET || "secret",
  rag: process.env.RAG_URL || "",
}

export default config

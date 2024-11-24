import dotenv from "dotenv"
dotenv.config()

const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  db: process.env.MONGO_URL || "",
  secret: process.env.SECRET || 'secret'
}

export default config

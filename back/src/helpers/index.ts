import axios from "axios"
import config from "../common/config"
import { createHmac, randomBytes } from "crypto"

export const random = () => randomBytes(128).toString("base64")
export const auth = (salt: string, password: string) => {
  return createHmac("sha256", [salt, password].join("/"))
    .update(config.secret)
    .digest("hex")
}

export const ragRequest = async (text: string) => {
  const requestConfig = { headers: { "Content-Type": "application/json" } }

  const data = {
    input_text: text,
  }

  const {
    data: { response },
  } = await axios.post(config.rag, data, requestConfig)

  return response
}

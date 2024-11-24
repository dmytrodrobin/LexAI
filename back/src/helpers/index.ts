import config from "../common/config"
import { createHmac, randomBytes } from "crypto"

export const random = () => randomBytes(128).toString("base64")
export const auth = (salt: string, password: string) => {
  return createHmac("sha256", [salt, password].join("/"))
    .update(config.secret)
    .digest("hex")
}

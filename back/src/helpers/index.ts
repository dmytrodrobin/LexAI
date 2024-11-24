import { createHmac, randomBytes } from "crypto"

const SECRET = process.env.SECRET

export const random = () => randomBytes(128).toString("base64")
export const auth = (salt: string, password: string) => {
  return createHmac("sha256", [salt, password].join("/"))
    .update(SECRET)
    .digest("hex")
}

import express from "express"
import http from "http"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import compression from "compression"
import cors from "cors"
import router from "./router"
import config from "./common/config"
import mongoose from "mongoose"

const app = express()

app.use(
  cors({
    credentials: true,
  })
)

app.use(compression())
app.use(cookieParser())
app.use(bodyParser.json())

const server = http.createServer(app)
server.listen( config.host, config.port, () =>
  console.log(`Server started on port ${config.port}`)
)

mongoose.Promise = Promise
mongoose.connect(config.db)
mongoose.connection.on("error", console.error)

app.use("/", router())

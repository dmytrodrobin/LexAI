import express from 'express';

const router = express.Router();

export default (): express.Router => {
    router.get("/hello", (req: express.Request, res: express.Response) => {res.status(200).send('<p>Hello World!</p>')})
    return router;
}
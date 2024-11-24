import { getUserByToken } from "repositories/user";
import express from "express";
import { merge } from "lodash";
import { Constants } from "common/constants";
export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const data = JSON.parse(req.cookies[Constants.AuthTokenName]);

    if (!data.sessionToken) {
      return res.sendStatus(403);
    }

    const user = await getUserByToken(data.sessionToken);

    if (!user) {
      return res.sendStatus(403);
    }

    merge(req, { identity: user });

    return next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

import { Router } from "express";

import { ioDevServerConfig } from "../config";
import { addHandler } from "../payloads/response";
import { sendFileFromRootPath } from "../utils/file";
import { addApiV1Prefix } from "../utils/strings";

export const miscRouter = Router();

addHandler(miscRouter, "get", "/myportal_playground.html", (_, res) => {
  sendFileFromRootPath("assets/html/myportal_playground.html", res);
});

/**
 * API dedicated to dev- server
 * return the current dev-server configuration
 */
addHandler(miscRouter, "get", "/config", (_, res) => {
  res.json(ioDevServerConfig);
});

/**
 * API dedicated to status
 * return the current server status
 */
addHandler(miscRouter, "get", addApiV1Prefix("/ping"), (_, res) => {
  res.sendStatus(204);
});

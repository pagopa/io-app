import { PAGOPA_PLATFORM_SESSION_TOKEN } from "../utils/platform";
import { addPlatformHandler } from "./router";

// Generates a new pagoPA platform session token
addPlatformHandler("post", "/session", (_, res) =>
  res.status(201).json({ token: PAGOPA_PLATFORM_SESSION_TOKEN })
);

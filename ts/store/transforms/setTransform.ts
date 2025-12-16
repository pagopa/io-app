import { createTransform } from "redux-persist";

export const createSetTransform = (whitelist?: Array<string>) =>
  createTransform(
    (inboundState: any) => Array.from(inboundState),
    (outboundState: any) => new Set(outboundState),
    { whitelist }
  );

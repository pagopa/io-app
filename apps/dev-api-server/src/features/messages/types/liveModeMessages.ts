import * as t from "io-ts";

export const LiveModeMessages = t.interface({
  // interval between updates in millis
  interval: t.number,
  // number of new messages
  count: t.number
});

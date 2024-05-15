/**
 * this type models an object that represents the params needed by the ServicesWebviewScreen to work
 * see https://www.pivotaltracker.com/story/show/174801117
 */
import * as t from "io-ts";

export const FimsWebviewParams = t.interface({
  url: t.string
});

export type FimsWebviewParams = t.TypeOf<typeof FimsWebviewParams>;

import { NumberFromString } from "@pagopa/ts-commons/lib/numbers";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as t from "io-ts";

// codec to handle query params coming from /messages get API
export const GetMessagesParameters = t.partial({
  pageSize: NumberFromString,
  enrichResultData: t.boolean,
  maximumId: NonEmptyString,
  minimumId: NonEmptyString,
  getArchived: t.boolean
});

export type GetMessagesParameters = t.TypeOf<typeof GetMessagesParameters>;

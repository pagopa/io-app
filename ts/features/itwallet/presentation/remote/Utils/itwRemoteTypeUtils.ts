import * as t from "io-ts";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";

// TODO: This will be imported from io-react-native-wallet, when the type will be available
// Remote presentation QR code data
export const ItwRemoteRequestPayload = t.intersection([
  t.type({
    client_id: NonEmptyString,
    request_uri: NonEmptyString,
    state: NonEmptyString
  }),
  t.partial({
    request_uri_method: t.union([t.string, t.null, t.undefined])
  })
]);

export type ItwRemoteRequestPayload = t.TypeOf<typeof ItwRemoteRequestPayload>;

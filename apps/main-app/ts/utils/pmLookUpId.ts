/**
 * utility that manages the lookup ID injected in some PM flows toward the Payment Manager
 * more info https://pagopa.atlassian.net/wiki/spaces/IOAPP/pages/135693522/PM+-+tracking+delle+chiamate+di+rete
 */
import { v4 as uuid } from "uuid";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";

export type LookUpId = string | undefined;
// eslint-disable-next-line functional/no-let
let pmLookUpId: LookUpId;
export const pmLookupHeaderKey = "Request-Id";
export const getLookUpId = (): LookUpId => pmLookUpId;
// return the lookupID inside a plain object where the key is pmLookupHeaderKey
export const getLookUpIdPO = (): Record<string, string> =>
  pipe(
    getLookUpId(),
    O.fromNullable,
    O.fold(
      () => ({}),
      id => ({
        [pmLookupHeaderKey]: id
      })
    )
  );
export const newLookUpId = (): LookUpId => {
  pmLookUpId = uuid();
  return pmLookUpId;
};
export const resetLookUpId = (): void => {
  pmLookUpId = undefined;
};

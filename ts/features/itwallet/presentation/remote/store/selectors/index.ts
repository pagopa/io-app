import { createSelector } from "reselect";
import * as O from "fp-ts/lib/Option";
import { SdJwt } from "@pagopa/io-react-native-wallet-v2";
import {
  itwCredentialsEidSelector,
  itwCredentialsSelector
} from "../../../../credentials/store/selectors";
import { assert } from "../../../../../../utils/assert";
import { StoredCredential } from "../../../../common/utils/itwTypesUtils";

/**
 * Select credentials to be used in a remote presentation and evaluated against a DQCL query.
 * They are keyed by VCT to be compatible with the DCQL query evaluation.
 */
export const itwRemotePresentationCredentialsSelector = createSelector(
  itwCredentialsEidSelector,
  itwCredentialsSelector,
  (eid, credentials) => {
    assert(O.isSome(eid), "Missing PID");

    const { sdJwt } = SdJwt.decode(eid.value.credential);

    return {
      [sdJwt.payload.vct]: eid.value,
      ...Object.values(credentials).reduce((acc, c) => {
        const { sdJwt } = SdJwt.decode(c.credential);
        // eslint-disable-next-line functional/immutable-data
        acc[sdJwt.payload.vct] = c;
        return acc;
      }, {} as Record<string, StoredCredential>)
    };
  }
);

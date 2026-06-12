import { createSelector } from "reselect";
import { ItwVersion } from "@pagopa/io-react-native-wallet";
import * as O from "fp-ts/lib/Option";
import { GlobalState } from "../../../../../store/reducers/types";
import { itwCredentialsEidSelector } from "../../../credentials/store/selectors";
import { itwIsL3EnabledSelector } from "./preferences";

export const selectItwEnv = (state: GlobalState) =>
  state.features.itWallet.environment.env ?? "prod";

export const selectItwSpecsVersion = createSelector(
  itwIsL3EnabledSelector,
  itwCredentialsEidSelector,
  (isWhitelisted, eidOption): ItwVersion => {
    // Users that are not whitelisted can only have Documenti su IO 1.0
    if (!isWhitelisted) {
      return "1.0.0";
    }
    // Otherwise the specification version is determined by the current EID
    const eid = O.toUndefined(eidOption);
    if (eid) {
      return eid.spec_version as ItwVersion;
    }
    // Users that are whitelisted and don't have an EID use the latest version by default
    return "1.3.3";
  }
);

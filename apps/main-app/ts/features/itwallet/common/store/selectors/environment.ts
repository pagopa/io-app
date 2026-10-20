import { CieIdEnvironment } from "@pagopa/io-react-native-cieid";
import { ItwVersion } from "@pagopa/io-react-native-wallet";
import { createSelector } from "reselect";

import { GlobalState } from "../../../../../store/reducers/types";
import { itwCredentialsEidSelector } from "../../../credentials/store/selectors";
import {
  isItWalletAvailable,
  itwLifecycleStateSelector
} from "../../../lifecycle/store/selectors";
import { CURRENT_ITW_SPECS_VERSION } from "../../utils/constants";

export const selectItwEnv = (state: GlobalState) =>
  state.features.itWallet.environment.env ?? "prod";

/**
 * The CieID app environment that the app-to-app flow must target.
 *
 * The IT-Wallet pre-production environment is paired with the `coll` CieID app
 * (`it.ipzs.cieid.coll`, a different Android package name), otherwise the
 * production CieID app would authenticate against production IdP endpoints,
 * which are not compatible with the pre-production IT-Wallet ecosystem.
 *
 * Note that this is not the `preprod` CieID environment
 * (`it.ipzs.cieid.collaudo`), which is only used by the CIE login UAT flag.
 */
export const selectItwCieIdEnvironment = (
  state: GlobalState
): CieIdEnvironment => (selectItwEnv(state) === "pre" ? "coll" : "production");

/**
 * Select the IT-Wallet specification version depending on the user
 * configuration.
 *
 * The version is derived from the wallet lifecycle and the optional presence of
 * a PID, and it is used for every API call to the IT-Wallet ecosystem actors.
 */
export const selectItwSpecsVersion = createSelector(
  itwLifecycleStateSelector,
  itwCredentialsEidSelector,
  (lifecycle, eid): ItwVersion => {
    // Users that cannot use IT-Wallet can only have Documenti su IO 1.0
    if (!isItWalletAvailable(lifecycle)) {
      return "1.0.0";
    }
    // Otherwise the specification version is determined by the current EID
    if (eid) {
      return eid.spec_version as ItwVersion;
    }
    // Users that can activate IT-Wallet and don't have an EID use the latest version by default
    return CURRENT_ITW_SPECS_VERSION;
  }
);

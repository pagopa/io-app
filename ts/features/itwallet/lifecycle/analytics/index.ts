import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { updatePropertiesWalletRevoked } from "../../analytics/properties/propertyUpdaters";
import { WalletInstanceRevocationReason } from "../../common/utils/itwTypesUtils";
import {
  ITW_LIFECYCLE_ACTIONS_EVENTS,
  ITW_LIFECYCLE_ERRORS_EVENTS
} from "./enum";

export const trackWalletNewIdReset = () => {
  updatePropertiesWalletRevoked();
  void mixpanelTrack(
    ITW_LIFECYCLE_ACTIONS_EVENTS.ITW_NEW_ID_RESET,
    buildEventProperties("UX", "action")
  );
};

export const trackItwIdNotMatch = () => {
  void mixpanelTrack(
    ITW_LIFECYCLE_ERRORS_EVENTS.ITW_LOGIN_ID_NOT_MATCH,
    buildEventProperties("KO", "error")
  );
};

export const trackItwStatusWalletAttestationFailure = () => {
  void mixpanelTrack(
    ITW_LIFECYCLE_ERRORS_EVENTS.ITW_STATUS_WALLET_ATTESTATION_FAILURE,
    buildEventProperties("KO", "error")
  );
};

export const trackItwWalletInstanceRevocation = (
  reason: WalletInstanceRevocationReason
) => {
  void mixpanelTrack(
    ITW_LIFECYCLE_ERRORS_EVENTS.ITW_INSTANCE_REVOKED,
    buildEventProperties("KO", "error", { reason })
  );
};

export const trackItwWalletBadState = () => {
  void mixpanelTrack(
    ITW_LIFECYCLE_ERRORS_EVENTS.ITW_BAD_STATE_WALLET_DEACTIVATED,
    buildEventProperties("KO", "error")
  );
};
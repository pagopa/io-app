import { hashedProfileFiscalCodeSelector } from "../../../../../store/reducers/crossSessions";
import { GlobalState } from "../../../../../store/reducers/types";
import { itwIsFiscalCodeWhitelisted } from "../../../common/store/selectors/preferences";
import {
  isItwEnabledSelector,
  isItwWhatsNewMinAppVersionSupportedSelector
} from "../../../common/store/selectors/remoteConfig";
import { isItwCredential } from "../../../common/utils/itwCredentialUtils";
import { itwCredentialsEidSelector } from "../../../credentials/store/selectors";

/** Whether the engagement screen has already been shown to the current user. */
export const itwIsEngagementScreenShownSelector = (state: GlobalState) => {
  const user = hashedProfileFiscalCodeSelector(state);
  return (
    user !== undefined &&
    state.features.itWallet.preferences.engagementScreenShownByUser?.[user] ===
      true
  );
};

export const itwShouldShowEngagementScreenSelector = (state: GlobalState) => {
  const eid = itwCredentialsEidSelector(state);

  return (
    isItwEnabledSelector(state) &&
    isItwWhatsNewMinAppVersionSupportedSelector(state) &&
    itwIsFiscalCodeWhitelisted(state) &&
    !itwIsEngagementScreenShownSelector(state) &&
    !(eid && isItwCredential(eid))
  );
};

import { hashedProfileFiscalCodeSelector } from "../../../../../store/reducers/crossSessions";
import { GlobalState } from "../../../../../store/reducers/types";
import { itwIsFiscalCodeWhitelisted } from "../../../common/store/selectors/preferences";
import {
  isItwEnabledSelector,
  isItwWhatsNewMinAppVersionSupportedSelector
} from "../../../common/store/selectors/remoteConfig";
import { isItwCredential } from "../../../common/utils/itwCredentialUtils";
import { itwCredentialsEidSelector } from "../../../credentials/store/selectors";

export const itwShouldShowEngagementScreenSelector = (state: GlobalState) => {
  const user = hashedProfileFiscalCodeSelector(state);
  const eid = itwCredentialsEidSelector(state);

  return (
    user !== undefined &&
    isItwEnabledSelector(state) &&
    isItwWhatsNewMinAppVersionSupportedSelector(state) &&
    itwIsFiscalCodeWhitelisted(state) &&
    state.features.itWallet.preferences.engagementScreenShownByUser?.[user] !==
      true &&
    !(eid && isItwCredential(eid))
  );
};

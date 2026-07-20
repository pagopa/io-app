import { Linking } from "react-native";
import { Action, Dispatch, Store } from "redux";

import { isLoggedIn } from "../features/authentication/common/store/utils/guards";
import { IO_LOGIN_CIE_URL_SCHEME } from "../features/authentication/login/cie/utils/cie";
import { parseCredentialOfferLink } from "../features/itwallet/offer/utils";
import { storeLinkingUrl } from "../features/linking/actions";
import { trackIOOpenedFromUniversalAppLink } from "../features/linking/analytics";
import { resetMessageArchivingAction } from "../features/messages/store/actions/archiving";
import { isArchivingDisabledSelector } from "../features/messages/store/reducers/archiving";
import { initiateAarFlow } from "../features/pn/aar/store/actions";
import { isSendAarLink } from "../features/pn/aar/utils/deepLinking";
import { processUtmLink } from "../features/utmLink";
import { walletUpdate } from "../features/wallet/store/actions";
import { isMixpanelEnabled } from "../store/reducers/persistedPreferences";
import { GlobalState } from "../store/reducers/types";
import { shouldTriggerWalletUpdate } from "../utils/deepLinkUtils";

// as of writing this, the only deep link that is dispatched after an app wake, but before the login's completion
// is the CIEID login one.
// it is then necessary to ignore it to avoid letting it rewrite other deep links that may be useful after login.
const deepLinkStorageBlacklist: Array<RegExp> = [
  new RegExp(`^${IO_LOGIN_CIE_URL_SCHEME}`, "i")
];
const isDeepLinkBlackListed = (url: string): boolean =>
  deepLinkStorageBlacklist.some(regex => regex.test(url.trim()));

export const linkingSubscription =
  (dispatch: Dispatch<Action>, store: Store<Readonly<GlobalState>>) =>
  (listener: (url: string) => void) => {
    const subscription = Linking.addEventListener("url", ({ url }) => {
      // track if the app is opened from a universal link, but only if the url
      // is an https link, to avoid tracking custom scheme deep links that are
      // not universal links
      // We read the user's Mixpanel preference from the store to respect their choice
      const state = store.getState();
      const mixpanelEnabled = isMixpanelEnabled(state);
      trackIOOpenedFromUniversalAppLink(url, mixpanelEnabled);
      // Message archiving/restoring hides the bottom tab bar so we must make
      // sure that either it is disabled or we manually deactivate it, otherwise
      // a deep link may initiate a navigation flow that will later deliver the
      // user to a screen where the tab bar is hidden (while it should be shown)
      const isArchivingDisabled = isArchivingDisabledSelector(state);
      if (!isArchivingDisabled) {
        // Auto-reset does not provide feedback to the user
        dispatch(resetMessageArchivingAction(undefined));
      }

      if (isLoggedIn(state.authentication)) {
        // only when logged in we can navigate to the AAR screen.
        if (isSendAarLink(state, url)) {
          dispatch(initiateAarFlow({ aarUrl: url }));
        }

        // Trigger wallet update for external Universal Links and specific internal paths
        // when the user is authenticated and the app is already running
        if (shouldTriggerWalletUpdate(url)) {
          dispatch(walletUpdate());
        }
      } else {
        // If we are not logged in, we store the URL to be processed later

        // we avoid deepLinks that are handled in other parts of the app in order
        // to not let them overwrite deepLinks queued for processing after login.
        if (!isDeepLinkBlackListed(url)) {
          dispatch(storeLinkingUrl(url));
        }
      }

      // If we have a deep link with utm_medium and utm_source parameters, we want to track it
      // We don't enter this point if the app is opened from scratch with a deep link,
      // but we track it in the `useOnFirstRender` hook on the AppStackNavigator
      processUtmLink(url, dispatch);
      const credentialOfferLink = parseCredentialOfferLink(url);
      if (credentialOfferLink !== undefined) {
        listener(credentialOfferLink.internalRoute);
        return;
      }
      listener(url);
    });
    return () => {
      subscription.remove();
    };
  };

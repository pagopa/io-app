import { Linking } from "react-native";
import { Action, Dispatch, Store } from "redux";
import { isLoggedIn } from "../features/authentication/common/store/utils/guards";
import { storeLinkingUrl } from "../features/linking/actions";
import { resetMessageArchivingAction } from "../features/messages/store/actions/archiving";
import { isArchivingDisabledSelector } from "../features/messages/store/reducers/archiving";
import { isSendAARLink } from "../features/pn/aar/utils/deepLinking";
import { processUtmLink } from "../features/utmLink";
import { walletUpdate } from "../features/wallet/store/actions";
import { shouldTriggerWalletUpdate } from "../utils/deepLinkUtils";
import { GlobalState } from "../store/reducers/types";
import { initiateAarFlow } from "../features/pn/aar/store/actions";
import { IO_LOGIN_CIE_URL_SCHEME } from "../features/authentication/login/cie/utils/cie";

const deepLinkStorageBlacklist: Array<RegExp> = [
  new RegExp(`^${IO_LOGIN_CIE_URL_SCHEME}`, "i")
];
const isDeepLinkBlackListed = (url: string): boolean =>
  deepLinkStorageBlacklist.some(regex => regex.test(url.trim()));

export const linkingSubscription =
  (dispatch: Dispatch<Action>, store: Store<Readonly<GlobalState>>) =>
  (listener: (url: string) => void) => {
    const subscription = Linking.addEventListener("url", ({ url }) => {
      // Message archiving/restoring hides the bottom tab bar so we must make
      // sure that either it is disabled or we manually deactivate it, otherwise
      // a deep link may initiate a navigation flow that will later deliver the
      // user to a screen where the tab bar is hidden (while it should be shown)
      const state = store.getState();
      const isArchivingDisabled = isArchivingDisabledSelector(state);
      if (!isArchivingDisabled) {
        // Auto-reset does not provide feedback to the user
        dispatch(resetMessageArchivingAction(undefined));
      }

      if (isLoggedIn(state.authentication)) {
        // only when logged in we can navigate to the AAR screen.
        if (isSendAARLink(state, url)) {
          dispatch(initiateAarFlow({ aarUrl: url }));
        }

        // Trigger wallet update for external Universal Links and specific internal paths
        // when the user is authenticated and the app is already running
        if (shouldTriggerWalletUpdate(url)) {
          dispatch(walletUpdate());
        }
      } else {
        // If we are not logged in, we store the URL to be processed later

        // as of writing, the only deep link that is dispatched after an app wake, but before the login's completion
        // is the CIEID login one.
        // it is then necessary to ignore it to avoid letting it rewrite other deep links that may be useful after login.
        if (!isDeepLinkBlackListed(url)) {
          dispatch(storeLinkingUrl(url));
        }
      }

      // If we have a deep link with utm_medium and utm_source parameters, we want to track it
      // We don't enter this point if the app is opened from scratch with a deep link,
      // but we track it in the `useOnFirstRender` hook on the AppStackNavigator
      processUtmLink(url, dispatch);
      listener(url);
    });
    return () => {
      subscription.remove();
    };
  };

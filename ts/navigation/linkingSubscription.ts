import { Linking } from "react-native";
import { Action, Dispatch, Store } from "redux";
import { isLoggedIn } from "../features/authentication/common/store/utils/guards";
import { MESSAGES_ROUTES } from "../features/messages/navigation/routes";
import { resetMessageArchivingAction } from "../features/messages/store/actions/archiving";
import { isArchivingDisabledSelector } from "../features/messages/store/reducers/archiving";
import { isSendAARLink } from "../features/pn/aar/utils/deepLinking";
import PN_ROUTES from "../features/pn/navigation/routes";
import { processUtmLink } from "../features/utmLink";
import { storeLinkingUrl } from "../store/actions/linking";
import { GlobalState } from "../store/reducers/types";
import NavigationService from "./NavigationService";

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
          NavigationService.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
            screen: PN_ROUTES.MAIN,
            params: {
              screen: PN_ROUTES.QR_SCAN_FLOW,
              params: { aarUrl: url }
            }
          });
        }
      } else {
        // If we are not logged in, we store the URL to be processed later
        dispatch(storeLinkingUrl(url));
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

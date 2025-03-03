import { Linking } from "react-native";
import { Action, Dispatch, Store } from "redux";
import { GlobalState } from "../store/reducers/types";
import { isArchivingDisabledSelector } from "../features/messages/store/reducers/archiving";
import { resetMessageArchivingAction } from "../features/messages/store/actions/archiving";
import { processUtmLink } from "../features/utmLink";

export const linkingSubscription =
  (dispatch: Dispatch<Action>, store: Store<Readonly<GlobalState>>) =>
  (listener: (url: string) => void) => {
    const linkingSubscription = Linking.addEventListener("url", ({ url }) => {
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
      // If we have a deep link with utm_medium and utm_source parameters, we want to track it
      // We don't enter this point if the app is opened from scratch with a deep link,
      // but we track it in the `useOnFirstRender` hook on the AppStackNavigator
      processUtmLink(url, dispatch);
      listener(url);
    });
    return () => {
      linkingSubscription.remove();
    };
  };

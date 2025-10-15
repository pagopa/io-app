import {
  call,
  cancel,
  FixedTask,
  fork,
  put,
  select,
  take,
  takeEvery
} from "typed-redux-saga/macro";
import { StackActions } from "@react-navigation/native";
import { v4 as uuidv4 } from "uuid";
import NavigationService from "../../../../navigation/NavigationService";
import PN_ROUTES from "../../navigation/routes";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import {
  isPnRemoteEnabledSelector,
  pnMessagingServiceIdSelector
} from "../../../../store/reducers/backendStatus/remoteConfig";
import { hasSendEngagementScreenBeenDismissedSelector } from "../store/reducers";
import { isPnServiceEnabled } from "../../reminderBanner/reducer/bannerDismiss";
import { loadServicePreference } from "../../../services/details/store/actions/preference";
import { setSecurityAdviceReadyToShow } from "../../../authentication/fastLogin/store/actions/securityAdviceActions";

export function* checkShouldDisplaySendEngagementScreen(
  isFirstOnboarding: boolean
) {
  // If the user comes from a first onboarding, the engagement screen shall not be shown
  if (isFirstOnboarding) {
    yield* put(setSecurityAdviceReadyToShow(true));
    return;
  }
  const hasSendEngagementScreenBeenDismissed = yield* select(
    hasSendEngagementScreenBeenDismissedSelector
  );
  const isPnRemoteEnabled = yield* select(isPnRemoteEnabledSelector);
  const isPnInboxEnabled = yield* select(isPnServiceEnabled);

  if (typeof isPnInboxEnabled === "undefined") {
    const guid = uuidv4();

    const task: FixedTask<void> = yield* fork(function* () {
      yield* takeEvery(loadServicePreference.success, function* ({ payload }) {
        const pnMessagingServiceId = yield* select(
          pnMessagingServiceIdSelector
        );

        if (pnMessagingServiceId === payload.id) {
          const updatedIsSendServiceEnabled = yield* select(isPnServiceEnabled);
          yield* call(
            handleNavigateToSendEngagementScreen,
            !hasSendEngagementScreenBeenDismissed,
            isPnRemoteEnabled,
            !updatedIsSendServiceEnabled
          );
          yield* put({ type: guid });
        }
      });
      yield* take(guid);
      yield* cancel(task);
    });
  } else {
    yield* call(
      handleNavigateToSendEngagementScreen,
      !hasSendEngagementScreenBeenDismissed,
      isPnRemoteEnabled,
      !isPnInboxEnabled
    );
  }
}

export function* handleNavigateToSendEngagementScreen(
  ...conditions: Array<boolean>
) {
  if (conditions.every(Boolean)) {
    yield* call(
      NavigationService.dispatchNavigationAction,
      StackActions.push(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
        screen: PN_ROUTES.MAIN,
        params: {
          screen: PN_ROUTES.SEND_ENGAGEMENT_ON_FIRST_APP_OPENING
        }
      })
    );
  } else {
    yield* put(setSecurityAdviceReadyToShow(true));
  }
}

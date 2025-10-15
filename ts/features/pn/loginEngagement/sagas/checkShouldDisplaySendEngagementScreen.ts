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
    const task: FixedTask<void> = yield* fork(function* () {
      yield* takeEvery(loadServicePreference.success, function* ({ payload }) {
        const pnMessagingServiceId = yield* select(
          pnMessagingServiceIdSelector
        );

        if (pnMessagingServiceId === payload.id) {
          // eslint-disable-next-line @typescript-eslint/no-shadow
          const isPnInboxEnabled = yield* select(isPnServiceEnabled);
          yield* call(
            handleNavigateToSendEngagementScreen,
            !hasSendEngagementScreenBeenDismissed,
            isPnRemoteEnabled,
            !isPnInboxEnabled
          );
          yield* put({ type: "CANCEL_TASK" });
        }
      });
      yield* take("CANCEL_TASK");
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

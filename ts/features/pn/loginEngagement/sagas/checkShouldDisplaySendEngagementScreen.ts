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
  isPnRemoteEnabledSelector as isSendRemoteEnabledSelector,
  pnMessagingServiceIdSelector as sendServiceIdSelector
} from "../../../../store/reducers/backendStatus/remoteConfig";
import { hasSendEngagementScreenBeenDismissedSelector } from "../store/reducers";
import { isPnServiceEnabled as isSendServiceEnabledSelector } from "../../reminderBanner/reducer/bannerDismiss";
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
  const isSendEnabled = yield* select(isSendRemoteEnabledSelector);
  const isSendServiceEnabled = yield* select(isSendServiceEnabledSelector);

  if (typeof isSendServiceEnabled === "undefined") {
    const guid = uuidv4();

    const task: FixedTask<void> = yield* fork(function* () {
      yield* takeEvery(loadServicePreference.success, function* ({ payload }) {
        const sendServiceId = yield* select(sendServiceIdSelector);

        if (sendServiceId === payload.id) {
          const updatedIsSendServiceEnabled = yield* select(
            isSendServiceEnabledSelector
          );
          yield* call(
            handleNavigateToSendEngagementScreen,
            !hasSendEngagementScreenBeenDismissed,
            isSendEnabled,
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
      isSendEnabled,
      !isSendServiceEnabled
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

import { call, put, select, take } from "typed-redux-saga/macro";
import { ActionType, isActionOf } from "typesafe-actions";

import NavigationService from "../../../../navigation/NavigationService";
import { isLoggedIn } from "../../../authentication/common/store/utils/guards";
import ZENDESK_ROUTES from "../../navigation/routes";
import {
  getZendeskToken,
  zendeskSupportBack,
  zendeskSupportCancel,
  zendeskSupportCompleted,
  zendeskSupportFailure,
  zendeskSupportStart
} from "../../store/actions";

export type ZendeskSupportResult = "back" | "cancel" | "completed" | "failure";

export function* zendeskSupportWorker(
  zendeskStart: ActionType<typeof zendeskSupportStart>
): Generator<any, ZendeskSupportResult, any> {
  const isLoggedinUser = yield* select(s => isLoggedIn(s.authentication));
  const needToNavigateInAskPermissionScreen = Object.values(
    zendeskStart.payload.assistanceType
  ).some(Boolean);

  if (needToNavigateInAskPermissionScreen && isLoggedinUser) {
    yield* put(getZendeskToken.request());
  }

  const currentRoute: ReturnType<typeof NavigationService.getCurrentRouteName> =
    yield* call(NavigationService.getCurrentRouteName);

  if (
    currentRoute !== undefined &&
    currentRoute !== ZENDESK_ROUTES.HELP_CENTER
  ) {
    yield* call(
      navigateToZendeskSupportScreen,
      needToNavigateInAskPermissionScreen,
      zendeskStart.payload
    );
  }

  const result = yield* take<
    ActionType<
      | typeof zendeskSupportBack
      | typeof zendeskSupportCancel
      | typeof zendeskSupportCompleted
      | typeof zendeskSupportFailure
    >
  >([
    zendeskSupportCompleted,
    zendeskSupportCancel,
    zendeskSupportBack,
    zendeskSupportFailure
  ]);

  if (isActionOf(zendeskSupportCompleted, result)) {
    return "completed";
  }

  if (isActionOf(zendeskSupportCancel, result)) {
    return "cancel";
  }

  if (isActionOf(zendeskSupportBack, result)) {
    return "back";
  }

  if (isActionOf(zendeskSupportFailure, result)) {
    return "failure";
  }

  throw new Error(`Unhandled case for ${result}`);
}

function* navigateToZendeskSupportScreen(
  needToNavigateInAskPermissionScreen: boolean,
  payload: ActionType<typeof zendeskSupportStart>["payload"]
) {
  yield* call(NavigationService.navigate, ZENDESK_ROUTES.MAIN, {
    screen: needToNavigateInAskPermissionScreen
      ? ZENDESK_ROUTES.ASK_PERMISSIONS
      : ZENDESK_ROUTES.HELP_CENTER,
    params: payload
  });
}

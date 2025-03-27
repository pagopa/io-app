import { CommonActions } from "@react-navigation/native";
import { call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import NavigationService from "../../../../navigation/NavigationService";
import {
  executeWorkUnit,
  withFailureHandling,
  withResetNavigationStack
} from "../../../../sagas/workUnit";
import ZENDESK_ROUTES from "../../navigation/routes";
import {
  getZendeskToken,
  zendeskSupportBack,
  zendeskSupportCancel,
  zendeskSupportCompleted,
  zendeskSupportFailure,
  zendeskSupportStart
} from "../../store/actions";
import { isLoggedIn } from "../../../authentication/common/store/utils/guards";

function* zendeskSupportWorkUnit(
  zendeskStart: ActionType<typeof zendeskSupportStart>
) {
  const isLoggedinUser = yield* select(s => isLoggedIn(s.authentication));
  const needToNavigateInAskPermissionScreen = Object.values(
    zendeskStart.payload.assistanceType
  ).some(Boolean);

  if (needToNavigateInAskPermissionScreen && isLoggedinUser) {
    yield* put(getZendeskToken.request());
  }

  return yield* call(executeWorkUnit, {
    startScreenNavigation: () => {
      NavigationService.dispatchNavigationAction(
        CommonActions.navigate(ZENDESK_ROUTES.MAIN, {
          screen: needToNavigateInAskPermissionScreen
            ? ZENDESK_ROUTES.ASK_PERMISSIONS
            : ZENDESK_ROUTES.HELP_CENTER,
          params: zendeskStart.payload
        })
      );
    },
    startScreenName: ZENDESK_ROUTES.HELP_CENTER,
    complete: zendeskSupportCompleted,
    back: zendeskSupportBack,
    cancel: zendeskSupportCancel,
    failure: zendeskSupportFailure
  });
}

export function* zendeskSupport(
  zendeskStart: ActionType<typeof zendeskSupportStart>
) {
  yield* call(withFailureHandling, () =>
    withResetNavigationStack(() => zendeskSupportWorkUnit(zendeskStart))
  );
}

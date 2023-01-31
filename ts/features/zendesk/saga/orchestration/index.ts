import { CommonActions } from "@react-navigation/native";
import { call } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import NavigationService from "../../../../navigation/NavigationService";
import {
  executeWorkUnit,
  withFailureHandling,
  withResetNavigationStack
} from "../../../../sagas/workUnit";
import ZENDESK_ROUTES from "../../navigation/routes";
import {
  zendeskSupportBack,
  zendeskSupportCancel,
  zendeskSupportCompleted,
  zendeskSupportFailure,
  zendeskSupportStart
} from "../../store/actions";

function* zendeskSupportWorkUnit(
  zendeskStart: ActionType<typeof zendeskSupportStart>
) {
  return yield* call(executeWorkUnit, {
    startScreenNavigation: () => {
      NavigationService.dispatchNavigationAction(
        CommonActions.navigate(ZENDESK_ROUTES.MAIN, {
          screen:
            zendeskStart.payload.assistanceForPayment ||
            zendeskStart.payload.assistanceForCard
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

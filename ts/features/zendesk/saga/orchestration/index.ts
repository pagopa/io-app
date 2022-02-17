import { NavigationActions } from "@react-navigation/compat";
import { call } from "redux-saga/effects";
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
  return yield call(executeWorkUnit, {
    startScreenNavigation: () => {
      NavigationService.dispatchNavigationAction(
        NavigationActions.navigate({
          routeName: ZENDESK_ROUTES.HELP_CENTER,
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
  yield call(withFailureHandling, () =>
    withResetNavigationStack(() => zendeskSupportWorkUnit(zendeskStart))
  );
}

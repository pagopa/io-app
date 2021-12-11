import { call } from "redux-saga/effects";
import { NavigationActions } from "react-navigation";
import {
  executeWorkUnit,
  withResetNavigationStack
} from "../../../../sagas/workUnit";
import {
  zendeskSupportBack,
  zendeskSupportCancel,
  zendeskSupportCompleted,
  zendeskSupportFailure,
  zendeskSupportStart
} from "../../store/actions";
import ZENDESK_ROUTES from "../../navigation/routes";
import NavigationService from "../../../../navigation/NavigationService";
import { ActionType } from "typesafe-actions";

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
  yield call(withResetNavigationStack, () =>
    zendeskSupportWorkUnit(zendeskStart)
  );
}

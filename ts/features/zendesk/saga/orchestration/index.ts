import { call } from "redux-saga/effects";
import {
  executeWorkUnit,
  withResetNavigationStack
} from "../../../../sagas/workUnit";
import {
  zendeskSupportBack,
  zendeskSupportCancel,
  zendeskSupportCompleted,
  zendeskSupportFailure
} from "../../store/actions";
import ZENDESK_ROUTES from "../../navigation/routes";
import NavigationService from "../../../../navigation/NavigationService";
import { NavigationActions } from "react-navigation";

function* zendeskSupportWorkUnit() {
  return yield call(executeWorkUnit, {
    startScreenNavigation: () => {
      NavigationService.dispatchNavigationAction(
        NavigationActions.navigate({
          routeName: ZENDESK_ROUTES.HELP_CENTER
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

export function* zendeskSupport() {
  yield call(withResetNavigationStack, zendeskSupportWorkUnit);
}

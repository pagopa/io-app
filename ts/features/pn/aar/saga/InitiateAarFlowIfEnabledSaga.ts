import { StackActions } from "@react-navigation/native";
import { call, put, select } from "typed-redux-saga/macro";
import NavigationService from "../../../../navigation/NavigationService";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import PN_ROUTES from "../../navigation/routes";
import { terminateAarFlow, tryInitiateAarFlow } from "../store/actions";
import {
  currentAARFlowStateType,
  currentAarFlowIunSelector
} from "../store/selectors";
import { sendAARFlowStates } from "../utils/stateUtils";

export function* initiateAarFlowIfEnabled(
  action: ReturnType<typeof tryInitiateAarFlow>
) {
  const aarUrl = action.payload.aarUrl;
  const currentFlowState = yield* select(currentAARFlowStateType);
  if (currentFlowState !== sendAARFlowStates.none) {
    const maybeIunFromAarFlowState = yield* select(currentAarFlowIunSelector);
    yield* put(terminateAarFlow({ messageId: maybeIunFromAarFlowState }));
    yield* call(
      NavigationService.dispatchNavigationAction,
      StackActions.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
        screen: PN_ROUTES.MAIN,
        params: {
          screen: PN_ROUTES.QR_SCAN_FLOW,
          params: { aarUrl }
        }
      })
    );
  } else {
    yield* call(
      NavigationService.navigate,
      MESSAGES_ROUTES.MESSAGES_NAVIGATOR,
      {
        screen: PN_ROUTES.MAIN,
        params: {
          screen: PN_ROUTES.QR_SCAN_FLOW,
          params: { aarUrl }
        }
      }
    );
  }
}

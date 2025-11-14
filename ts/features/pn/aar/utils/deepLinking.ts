import { StackActions } from "@react-navigation/native";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import NavigationService from "../../../../navigation/NavigationService";
import {
  isAarRemoteEnabled,
  pnAARQRCodeRegexSelector
} from "../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../store/reducers/types";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import PN_ROUTES from "../../navigation/routes";
import { terminateAarFlow } from "../store/actions";
import {
  currentAARFlowStateType,
  currentAarFlowIunSelector
} from "../store/selectors";
import { sendAARFlowStates } from "./stateUtils";
import { Action } from "../../../../store/actions/types";
export const isSendAARLink = (state: GlobalState, url: string) =>
  pipe(
    state,
    pnAARQRCodeRegexSelector,
    O.fromNullable,
    O.map(aarQRCodeRegexString => new RegExp(aarQRCodeRegexString, "i")),
    O.fold(
      () => false,
      regExp => regExp.test(url)
    )
  );

export const navigateToSendAarFlowIfEnabled = (
  state: GlobalState,
  aarUrl: string,
  dispatchFn: (action: Action) => void
) => {
  if (isAarRemoteEnabled(state)) {
    if (currentAARFlowStateType(state) !== sendAARFlowStates.none) {
      const maybeMessageIun = currentAarFlowIunSelector(state);
      dispatchFn(terminateAarFlow({ messageId: maybeMessageIun }));
      NavigationService.dispatchNavigationAction(
        StackActions.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
          screen: PN_ROUTES.MAIN,
          params: {
            screen: PN_ROUTES.QR_SCAN_FLOW,
            params: { aarUrl }
          }
        })
      );
    } else {
      NavigationService.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
        screen: PN_ROUTES.MAIN,
        params: {
          screen: PN_ROUTES.QR_SCAN_FLOW,
          params: { aarUrl }
        }
      });
    }
  }
};

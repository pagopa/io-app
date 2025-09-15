import { StackActions } from "@react-navigation/native";
import { takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { apiUrlPrefix } from "../../../../config";
import NavigationService from "../../../../navigation/NavigationService";
import { SessionToken } from "../../../../types/SessionToken";
import { KeyInfo } from "../../../lollipop/utils/crypto";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import PN_ROUTES from "../../navigation/routes";
import { createSendAARClientWithLollipop, SendAARClient } from "../api/client";
import { setAarFlowState } from "../store/actions";
import { sendAARFlowStates } from "../store/reducers";
import { fetchQrCodeSaga } from "./fetchQrCodeSaga";

function* aARFlowMasterSaga(
  action: ReturnType<typeof setAarFlowState>,
  sendAARClient: SendAARClient,
  sessionToken: SessionToken
) {
  const nextState = action.payload;

  switch (nextState.type) {
    case sendAARFlowStates.displayingAARToS:
      NavigationService.dispatchNavigationAction(
        StackActions.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
          screen: PN_ROUTES.MAIN,
          params: {
            screen: PN_ROUTES.SEND_AAR_TOS_SCREEN,
            params: { qrcode: nextState.qrCode }
          }
        })
      );
      break;
    case sendAARFlowStates.fetchingQRData:
      yield* fetchQrCodeSaga(nextState.qrCode, sendAARClient, sessionToken);
      break;

    default:
      break;
  }
}

export function* watchAARFlowSaga(
  sessionToken: SessionToken,
  keyInfo: KeyInfo
) {
  const sendAARClient = createSendAARClientWithLollipop(apiUrlPrefix, keyInfo);

  yield* takeLatest(
    getType(setAarFlowState),
    function* (action: ReturnType<typeof setAarFlowState>) {
      yield* aARFlowMasterSaga(action, sendAARClient, sessionToken);
    }
  );
}

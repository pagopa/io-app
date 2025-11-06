import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import { GlobalState } from "../../../../store/reducers/types";
import {
  isAarRemoteEnabled,
  pnAARQRCodeRegexSelector
} from "../../../../store/reducers/backendStatus/remoteConfig";
import PN_ROUTES from "../../navigation/routes";
import NavigationService from "../../../../navigation/NavigationService";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";

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
  aarUrl: string
) => {
  if (isAarRemoteEnabled(state)) {
    NavigationService.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
      screen: PN_ROUTES.MAIN,
      params: {
        screen: PN_ROUTES.QR_SCAN_FLOW,
        params: { aarUrl }
      }
    });
  }
};

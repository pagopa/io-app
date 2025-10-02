import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { StackActions } from "@react-navigation/native";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { call, put, select } from "typed-redux-saga/macro";
import { MessageSubject } from "../../../../../definitions/backend/MessageSubject";
import { ThirdPartyMessage as PnThirdPartyMessage } from "../../../../../definitions/pn/ThirdPartyMessage";
import { ThirdPartyMessage as AarThirdPartyMessage } from "../../../../../definitions/pn/aar/ThirdPartyMessage";
import NavigationService from "../../../../navigation/NavigationService";
import { pnMessagingServiceIdSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { SessionToken } from "../../../../types/SessionToken";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { getServiceDetails } from "../../../messages/saga/utils";
import PN_ROUTES from "../../navigation/routes";
import { SendAARClient } from "../api/client";
import {
  populateStoresWithEphemeralAarMessageData,
  setAarFlowState
} from "../store/actions";
import { currentAARFlowData } from "../store/reducers";
import { AarFlowStates, sendAARFlowStates } from "../utils/stateUtils";
import { profileFiscalCodeSelector } from "../../../settings/common/store/selectors";
import { isTestEnv } from "../../../../utils/environment";
import { fillerEphemeralAARMarkdown } from "../utils/detailsById";

export function* fetchAarDataSaga(
  fetchData: SendAARClient["getAARNotification"],
  sessionToken: SessionToken
) {
  const currentState = yield* select(currentAARFlowData);
  if (currentState.type !== sendAARFlowStates.fetchingNotificationData) {
    return;
  }
  try {
    const result = yield* call(fetchData, {
      Bearer: sessionToken,
      iun: currentState.iun,
      mandateId: currentState.mandateId
    });

    if (E.isLeft(result)) {
      yield* put(
        setAarFlowState({
          type: sendAARFlowStates.ko,
          previousState: currentState
        })
      );
      return;
    }
    const { status, value } = result.right;
    if (status === 200) {
      const payload = yield* call(
        aarMessageDataPayloadFromResponse,
        value,
        currentState
      );

      if (O.isNone(payload)) {
        return;
      }
      const data = payload.value;

      yield* put(populateStoresWithEphemeralAarMessageData(data));

      yield* call(
        NavigationService.dispatchNavigationAction,
        StackActions.push(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
          screen: PN_ROUTES.MAIN,
          params: {
            screen: PN_ROUTES.MESSAGE_DETAILS,
            params: {
              messageId: data.iun,
              serviceId: data.pnServiceID,
              firstTimeOpening: true
            }
          }
        })
      );
      yield* put(
        setAarFlowState({
          type: sendAARFlowStates.displayingNotificationData,
          notification: value,
          fullNameDestinatario: currentState.fullNameDestinatario,
          mandateId: currentState.mandateId
        })
      );
      return;
    }
    yield* put(
      setAarFlowState({
        type: sendAARFlowStates.ko,
        previousState: currentState
      })
    );
    return;
  } catch (e: any) {
    yield* put(
      setAarFlowState({
        type: sendAARFlowStates.ko,
        previousState: currentState
      })
    );
    return;
  }
}

function* aarMessageDataPayloadFromResponse(
  value: AarThirdPartyMessage,
  currentState: AarFlowStates<"fetchingNotificationData">
) {
  const fiscalCode = yield* select(profileFiscalCodeSelector);
  const pnServiceID = yield* select(pnMessagingServiceIdSelector);
  if (pnServiceID === undefined) {
    return O.none;
  }

  const pnServiceDetails = yield* getServiceDetails(pnServiceID);
  if (pnServiceDetails === undefined || fiscalCode === undefined) {
    return O.none;
  }

  return pipe(
    value,
    PnThirdPartyMessage.decode,
    O.fromEither,
    O.chainNullableK(v => v.details),
    O.map(({ iun, recipients, subject }) => ({
      iun: iun as NonEmptyString,
      thirdPartyMessage: value as PnThirdPartyMessage,
      fiscalCode: recipients[0]?.taxId ?? fiscalCode,
      pnServiceID: pnServiceDetails?.id,
      markDown: fillerEphemeralAARMarkdown,
      subject: subject as MessageSubject,
      mandateId: currentState.mandateId
    }))
  );
}

export const testable = isTestEnv
  ? { aarMessageDataPayloadFromResponse }
  : undefined;

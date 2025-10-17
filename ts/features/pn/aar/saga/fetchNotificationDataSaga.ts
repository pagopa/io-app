import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/lib/Either";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import { call, put, select } from "typed-redux-saga/macro";
import { MessageBodyMarkdown } from "../../../../../definitions/backend/MessageBodyMarkdown";
import { MessageSubject } from "../../../../../definitions/backend/MessageSubject";
import { ThirdPartyMessage as PnThirdPartyMessage } from "../../../../../definitions/pn/ThirdPartyMessage";
import { ThirdPartyMessage as AarThirdPartyMessage } from "../../../../../definitions/pn/aar/ThirdPartyMessage";
import { pnMessagingServiceIdSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { isPnTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { SessionToken } from "../../../../types/SessionToken";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../../types/utils";
import { isTestEnv } from "../../../../utils/environment";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { getServiceDetails } from "../../../services/common/saga/getServiceDetails";
import { profileFiscalCodeSelector } from "../../../settings/common/store/selectors";
import { SendAARClient } from "../api/client";
import {
  EphemeralAarMessageDataActionPayload,
  populateStoresWithEphemeralAarMessageData,
  setAarFlowState
} from "../store/actions";
import { currentAARFlowData } from "../store/selectors";
import { SendAARFailurePhase, sendAARFlowStates } from "../utils/stateUtils";
import {
  aarProblemJsonAnalyticsReport,
  trackSendAARFailure
} from "../analytics";
import { unknownToReason } from "../../../messages/utils";

const sendAARFailurePhase: SendAARFailurePhase = "Fetch Notification";

export function* fetchAarDataSaga(
  fetchData: SendAARClient["getAARNotification"],
  sessionToken: SessionToken
) {
  const currentState = yield* select(currentAARFlowData);
  if (currentState.type !== sendAARFlowStates.fetchingNotificationData) {
    yield* call(
      trackSendAARFailure,
      sendAARFailurePhase,
      `Called in wrong state (${currentState.type})`
    );
    return;
  }
  const isTest = yield* select(isPnTestEnabledSelector);
  try {
    const fetchAarRequest = fetchData({
      Bearer: `Bearer ${sessionToken}`,
      iun: currentState.iun,
      mandateId: currentState.mandateId,
      "x-pagopa-pn-io-src": "QRCODE",
      isTest
    });
    const result = (yield* call(
      withRefreshApiCall,
      fetchAarRequest
    )) as unknown as SagaCallReturnType<typeof fetchData>;

    if (E.isLeft(result)) {
      const reason = `Decoding failure (${readableReportSimplified(
        result.left
      )})`;
      yield* call(trackSendAARFailure, sendAARFailurePhase, reason);
      yield* put(
        setAarFlowState({
          type: sendAARFlowStates.ko,
          previousState: currentState,
          debugData: {
            phase: sendAARFailurePhase,
            reason
          }
        })
      );
      return;
    }

    const { status, value } = result.right;
    if (status !== 200) {
      const reason = `HTTP request failed (${aarProblemJsonAnalyticsReport(
        status,
        value
      )})`;
      yield* call(trackSendAARFailure, sendAARFailurePhase, reason);
      yield* put(
        setAarFlowState({
          type: sendAARFlowStates.ko,
          previousState: currentState,
          error: value,
          debugData: {
            phase: sendAARFailurePhase,
            reason
          }
        })
      );
      return;
    }

    const payloadEither = yield* call(
      aarMessageDataPayloadFromResponse,
      value,
      currentState.mandateId
    );
    if (E.isLeft(payloadEither)) {
      throw Error(payloadEither.left);
    }

    const payload = payloadEither.right;
    yield* put(populateStoresWithEphemeralAarMessageData(payload));
    yield* put(
      setAarFlowState({
        type: sendAARFlowStates.displayingNotificationData,
        notification: value,
        recipientInfo: { ...currentState.recipientInfo },
        mandateId: currentState.mandateId,
        iun: currentState.iun,
        pnServiceId: payload.pnServiceID
      })
    );
  } catch (e: unknown) {
    const reason = `An error was thrown (${unknownToReason(e)})`;
    yield* call(trackSendAARFailure, sendAARFailurePhase, reason);
    yield* put(
      setAarFlowState({
        type: sendAARFlowStates.ko,
        previousState: currentState,
        debugData: {
          phase: sendAARFailurePhase,
          reason
        }
      })
    );
  }
}

function* aarMessageDataPayloadFromResponse(
  value: AarThirdPartyMessage,
  mandateId: string | undefined
): Generator<
  ReduxSagaEffect,
  E.Either<string, EphemeralAarMessageDataActionPayload>
> {
  const fiscalCode = yield* select(profileFiscalCodeSelector);
  if (fiscalCode === undefined) {
    return E.left(`Unable to retrieve user fiscal code`);
  }

  const pnServiceID = yield* select(pnMessagingServiceIdSelector);
  if (pnServiceID === undefined) {
    return E.left(`Unable to retrieve sendServiceId`);
  }

  const sendMessageEither = PnThirdPartyMessage.decode(value);
  if (E.isLeft(sendMessageEither)) {
    return E.left(
      `Unable to decode AAR notification into SEND ThirdPartyMessage (${readableReportSimplified(
        sendMessageEither.left
      )})`
    );
  }

  // Make sure that the SEND service details are loaded. They are
  // not needed here but in the SEND notification screen in order
  // to display service details
  const sendServiceDetails = yield* getServiceDetails(pnServiceID);
  if (sendServiceDetails === undefined) {
    return E.left(`Unable to retrieve SEND service details`);
  }

  const sendMessage = sendMessageEither.right;
  const details = sendMessage.details;
  if (details == null) {
    return E.left(`Field 'details' in the AAR Notification is missing`);
  }

  const recipients = details?.recipients;
  const aarFlowState: EphemeralAarMessageDataActionPayload = {
    iun: details.iun as NonEmptyString,
    thirdPartyMessage: sendMessage,
    fiscalCode: recipients?.[0]?.taxId ?? fiscalCode,
    pnServiceID,
    markdown: "*".repeat(81) as MessageBodyMarkdown,
    subject: details.subject as MessageSubject,
    mandateId
  };
  return E.right(aarFlowState);
}

export const testable = isTestEnv
  ? { aarMessageDataPayloadFromResponse }
  : undefined;

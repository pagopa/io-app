import * as E from "fp-ts/lib/Either";
import { call, put, select } from "typed-redux-saga/macro";
import { pnMessagingServiceIdSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { SessionToken } from "../../../../types/SessionToken";
import { getServiceDetails } from "../../../messages/saga/utils";
import { SendAARClient } from "../api/client";
import { populateStoresWithEphemeralAarMessageData } from "../store/actions";
import { currentAARFlowData } from "../store/reducers";
import { sendAARFlowStates } from "../utils/stateUtils";

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
      return;
    }
    const { status, value } = result.right;
    if (status === 200) {
      const pnServiceID = yield* select(pnMessagingServiceIdSelector);
      if (pnServiceID === undefined) {
        // TODO:: GENERIC ERROR
        throw new Error("no PN service ID");
      }

      const pnServiceDetails = yield* call(getServiceDetails, pnServiceID);
      if (pnServiceDetails === undefined) {
        // TODO:: GENERIC ERROR
        throw new Error("no PN service details");
      }

      yield* put(
        populateStoresWithEphemeralAarMessageData({
          messageData: value,
          serviceData: pnServiceDetails,
          mandateId: currentState.mandateId
        })
      );
    }
  } catch {}
}

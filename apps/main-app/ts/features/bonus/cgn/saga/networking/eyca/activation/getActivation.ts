import { StatusEnum } from "@io-app/api-types/generated/definitions/cgn/EycaActivationDetail";
import * as E from "fp-ts/lib/Either";
import { call } from "typed-redux-saga/macro";

import {
  ReduxSagaEffect,
  SagaCallReturnType
} from "../../../../../../../types/utils";
import {
  getGenericError,
  getNetworkError,
  NetworkError
} from "../../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../../../authentication/fastLogin/saga/utils";
import { BackendCGN } from "../../../../api/backendCgn";
import { cgnEycaActivation } from "../../../../store/actions/eyca/activation";

export type GetEycaStatus = "COMPLETED" | "ERROR" | "NOT_FOUND" | "PROCESSING";

/**
 * Ask for the current status of EYCA activation it returns the status
 * {@link GetEycaStatus} - right case if an error occured it returns a
 * {@link NetworkError} - left case
 *
 * @param getEycaActivation
 */
export function* getActivation(
  getEycaActivation: ReturnType<typeof BackendCGN>["getEycaActivation"]
): Generator<ReduxSagaEffect, E.Either<NetworkError, GetEycaStatus>, any> {
  try {
    const getEycaActivationRequest = getEycaActivation({});
    const getEycaActivationResult = (yield* call(
      withRefreshApiCall,
      getEycaActivationRequest,
      cgnEycaActivation.request()
    )) as unknown as SagaCallReturnType<typeof getEycaActivation>;
    if (E.isRight(getEycaActivationResult)) {
      if (getEycaActivationResult.right.status === 200) {
        const result = getEycaActivationResult.right.value;
        switch (result.status) {
          case StatusEnum.COMPLETED:
            return E.right("COMPLETED");
          case StatusEnum.ERROR:
            return E.right("ERROR");
          case StatusEnum.PENDING:
          case StatusEnum.RUNNING:
            return E.right("PROCESSING");
          default: {
            const reason = `unexpected status result ${getEycaActivationResult.right.value.status}`;
            return E.left(getGenericError(new Error(reason)));
          }
        }
      } else if (getEycaActivationResult.right.status === 404) {
        return E.right("NOT_FOUND");
      } else {
        return E.left(
          getGenericError(
            new Error(`response status ${getEycaActivationResult.right.status}`)
          )
        );
      }
    } else {
      // decoding failure
      return E.left(
        getGenericError(
          new Error(readablePrivacyReport(getEycaActivationResult.left))
        )
      );
    }
  } catch (e) {
    return E.left(getNetworkError(e));
  }
}

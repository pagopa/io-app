import { StatusEnum } from "@io-app/api-types/generated/definitions/cgn/EycaActivationDetail";
import { err, ok, Result } from "neverthrow";
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

export type GetActivationResult = Result<GetEycaStatus, NetworkError>;

type GetEycaStatus = "COMPLETED" | "ERROR" | "NOT_FOUND" | "PROCESSING";

/**
 * ask for the current status of EYCA activation
 * it returns the status {@link GetEycaStatus} - ok case
 * if an error occured it returns a {@link NetworkError} - err case
 * @param getEycaActivation
 */
export function* getActivation(
  getEycaActivation: ReturnType<typeof BackendCGN>["getEycaActivation"]
): Generator<ReduxSagaEffect, GetActivationResult, any> {
  try {
    const getEycaActivationRequest = getEycaActivation({});
    const getEycaActivationResult = (yield* call(
      withRefreshApiCall,
      getEycaActivationRequest,
      cgnEycaActivation.request()
    )) as unknown as SagaCallReturnType<typeof getEycaActivation>;
    if ("right" in getEycaActivationResult) {
      if (getEycaActivationResult.right.status === 200) {
        const result = getEycaActivationResult.right.value;
        switch (result.status) {
          case StatusEnum.COMPLETED:
            return ok("COMPLETED");
          case StatusEnum.ERROR:
            return ok("ERROR");
          case StatusEnum.PENDING:
          case StatusEnum.RUNNING:
            return ok("PROCESSING");
          default: {
            const reason = `unexpected status result ${getEycaActivationResult.right.value.status}`;
            return err(getGenericError(new Error(reason)));
          }
        }
      } else if (getEycaActivationResult.right.status === 404) {
        return ok("NOT_FOUND");
      } else {
        return err(
          getGenericError(
            new Error(`response status ${getEycaActivationResult.right.status}`)
          )
        );
      }
    } else {
      // decoding failure
      return err(
        getGenericError(
          new Error(readablePrivacyReport(getEycaActivationResult.left))
        )
      );
    }
  } catch (e) {
    return err(getNetworkError(e));
  }
}

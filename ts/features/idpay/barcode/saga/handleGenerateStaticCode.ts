import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import {
  CodeEnum,
  TransactionErrorDTO
} from "../../../../../definitions/idpay/TransactionErrorDTO";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { IDPayClient } from "../../common/api/client";
import { idPayGenerateStaticCode } from "../store/actions";

const genericError: TransactionErrorDTO = {
  code: CodeEnum.PAYMENT_GENERIC_ERROR,
  message: "error"
};

export function* handleGenerateStaticCode(
  retrieveBarCodeTransaction: IDPayClient["retrievectiveBarCodeTransaction"],
  bearerToken: string,
  action: ActionType<typeof idPayGenerateStaticCode.request>
) {
  const retrieveBarCodeTransactionRequest = retrieveBarCodeTransaction({
    bearerAuth: bearerToken,
    initiativeId: action.payload.initiativeId
  });

  try {
    const retrieveBarCodeTransactionResult = (yield* call(
      withRefreshApiCall,
      retrieveBarCodeTransactionRequest,
      action
    )) as unknown as SagaCallReturnType<typeof retrieveBarCodeTransaction>;

    yield pipe(
      retrieveBarCodeTransactionResult,
      E.fold(
        () => {
          put(
            idPayGenerateStaticCode.failure({
              initiativeId: action.payload.initiativeId,
              error: genericError
            })
          );
        },
        response =>
          put(
            response.status === 200
              ? idPayGenerateStaticCode.success(response.value)
              : idPayGenerateStaticCode.failure({
                  initiativeId: action.payload.initiativeId,
                  error: getGenericError(
                    new Error(`response status code ${response.status}`)
                  )
                })
          )
      )
    );
  } catch (error) {
    yield* put(
      idPayGenerateStaticCode.failure({
        initiativeId: action.payload.initiativeId,
        error: getNetworkError(error)
      })
    );
  }
}

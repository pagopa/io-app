import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { getNetworkError } from "../../../../utils/errors";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { IDPayClient } from "../../common/api/client";
import { idPayGenerateBarcode } from "../store/actions";
import {
  TransactionErrorDTO,
  CodeEnum
} from "../../../../../definitions/idpay/TransactionErrorDTO";

const genericError: TransactionErrorDTO = {
  code: CodeEnum.PAYMENT_GENERIC_ERROR,
  message: "error"
};

export function* handleGenerateBarcode(
  createBarCodeTransaction: IDPayClient["createBarCodeTransaction"],
  bearerToken: string,
  action: ActionType<typeof idPayGenerateBarcode.request>
) {
  const createBarCodeTransactionRequest = createBarCodeTransaction({
    bearerAuth: bearerToken,
    body: {
      initiativeId: action.payload.initiativeId
    }
  });

  try {
    const createBarCodeTransactionResult = (yield* call(
      withRefreshApiCall,
      createBarCodeTransactionRequest,
      action
    )) as unknown as SagaCallReturnType<typeof createBarCodeTransaction>;

    yield pipe(
      createBarCodeTransactionResult,
      E.fold(
        () =>
          put(
            idPayGenerateBarcode.failure({
              initiativeId: action.payload.initiativeId,
              error: genericError
            })
          ),
        response =>
          put(
            response.status === 201
              ? idPayGenerateBarcode.success(response.value)
              : idPayGenerateBarcode.failure({
                  initiativeId: action.payload.initiativeId,
                  error: response.value || genericError
                })
          )
      )
    );
  } catch (error) {
    yield* put(
      idPayGenerateBarcode.failure({
        initiativeId: action.payload.initiativeId,
        error: getNetworkError(error)
      })
    );
  }
}

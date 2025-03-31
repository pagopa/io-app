import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import {
  CodeEnum,
  TransactionErrorDTO
} from "../../../../../definitions/idpay/TransactionErrorDTO";
import { SagaCallReturnType } from "../../../../types/utils";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { IDPayClient } from "../../common/api/client";
import { idPayGenerateBarcode } from "../store/actions";
import { getNetworkError } from "../../../../utils/errors";

export function* watchIDPayBarcodeSaga(
  idPayClient: IDPayClient,
  bearerToken: string
): SagaIterator {
  yield* takeLatest(
    idPayGenerateBarcode.request,
    handleGenerateBarcode,
    idPayClient.createBarCodeTransaction,
    bearerToken
  );
}

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
                  error: response.value
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

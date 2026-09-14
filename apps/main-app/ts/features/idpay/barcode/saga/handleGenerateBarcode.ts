import {
  CodeEnum,
  TransactionErrorDTO
} from "@io-app/api-types/generated/definitions/idpay/TransactionErrorDTO";
import { err, ok } from "neverthrow";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";

import { SagaCallReturnType } from "../../../../types/utils";
import { getNetworkError } from "../../../../utils/errors";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { IDPayClient } from "../../common/api/client";
import { idPayGenerateBarcode } from "../store/actions";

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

    yield (
      "isOk" in createBarCodeTransactionResult
        ? createBarCodeTransactionResult
        : "right" in createBarCodeTransactionResult
          ? ok(createBarCodeTransactionResult.right)
          : err(createBarCodeTransactionResult.left)
    ).match(
      response =>
        put(
          response.status === 201
            ? idPayGenerateBarcode.success(response.value)
            : idPayGenerateBarcode.failure({
                initiativeId: action.payload.initiativeId,
                error: response.value || genericError
              })
        ),
      () =>
        put(
          idPayGenerateBarcode.failure({
            initiativeId: action.payload.initiativeId,
            error: genericError
          })
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

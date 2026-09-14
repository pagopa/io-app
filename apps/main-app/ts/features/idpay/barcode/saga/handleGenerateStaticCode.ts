import {
  CodeEnum,
  TransactionErrorDTO
} from "@io-app/api-types/generated/definitions/idpay/TransactionErrorDTO";
import { IOToast } from "@io-app/design-system";
import I18n from "i18next";
import { err, ok } from "neverthrow";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";

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

    yield (
      "isOk" in retrieveBarCodeTransactionResult
        ? retrieveBarCodeTransactionResult
        : "right" in retrieveBarCodeTransactionResult
          ? ok(retrieveBarCodeTransactionResult.right)
          : err(retrieveBarCodeTransactionResult.left)
    ).match(
      response => {
        if (response.status === 200) {
          return put(idPayGenerateStaticCode.success(response.value));
        }
        IOToast.error(
          I18n.t(
            "idpay.initiative.beneficiaryDetails.staticCodeModal.staticCodeErrorAlert"
          )
        );
        return put(
          idPayGenerateStaticCode.failure({
            initiativeId: action.payload.initiativeId,
            error: getGenericError(
              new Error(`response status code ${response.status}`)
            )
          })
        );
      },
      () => {
        IOToast.error(
          I18n.t(
            "idpay.initiative.beneficiaryDetails.staticCodeModal.staticCodeErrorAlert"
          )
        );
        return put(
          idPayGenerateStaticCode.failure({
            initiativeId: action.payload.initiativeId,
            error: genericError
          })
        );
      }
    );
  } catch (error) {
    IOToast.error(
      I18n.t(
        "idpay.initiative.beneficiaryDetails.staticCodeModal.staticCodeErrorAlert"
      )
    );
    yield* put(
      idPayGenerateStaticCode.failure({
        initiativeId: action.payload.initiativeId,
        error: getNetworkError(error)
      })
    );
  }
}

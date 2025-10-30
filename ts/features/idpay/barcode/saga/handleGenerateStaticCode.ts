import { IOToast } from "@pagopa/io-app-design-system";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
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
        },
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
        }
      )
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

import { Either, left, right } from "fp-ts/lib/Either";
import {
  TypeofApiCall,
  TypeofApiResponse
} from "italia-ts-commons/lib/requests";

import {
  AmountInEuroCents,
  RptId,
  RptIdFromString
} from "italia-ts-commons/lib/pagopa";
import { CodiceContestoPagamento } from "../../../definitions/backend/CodiceContestoPagamento";
import { PaymentActivationsPostResponse } from "../../../definitions/backend/PaymentActivationsPostResponse";
import {
  ActivatePaymentT,
  GetActivationStatusT
} from "../../../definitions/backend/requestTypes";

import { extractNodoError, NodoErrors } from "../../types/errors";

import { amountToImportoWithFallback } from "../../utils/amounts";

/**
 * Utility functions for interacting with the nodo
 */

/**
 * Executes the "Attiva" operation on the PagoPa node.
 */
async function attivaRpt(
  postAttivaRpt: TypeofApiCall<ActivatePaymentT>,
  rptId: RptId,
  paymentContextCode: CodiceContestoPagamento,
  amount: AmountInEuroCents
): Promise<Either<NodoErrors, PaymentActivationsPostResponse>> {
  const response:
    | TypeofApiResponse<ActivatePaymentT>
    | undefined = await postAttivaRpt({
    paymentActivationsPostRequest: {
      rptId: RptIdFromString.encode(rptId),
      codiceContestoPagamento: paymentContextCode,
      importoSingoloVersamento: amountToImportoWithFallback(amount)
    }
  });
  return response !== undefined && response.status === 200
    ? right(response.value) // none if everything works out fine
    : left(extractNodoError(response));
}

/**
 * Polls the backend for the paymentId linked to the payment context code
 */
async function pollForPaymentId(
  getPaymentIdApi: TypeofApiCall<GetActivationStatusT>,
  paymentContextCode: CodiceContestoPagamento
): Promise<Either<NodoErrors, string>> {
  // successfully request the payment activation
  // now poll until a paymentId is made available

  const response = await getPaymentIdApi({
    codiceContestoPagamento: paymentContextCode
  });
  return response !== undefined && response.status === 200
    ? right(response.value.idPagamento)
    : response !== undefined && response.status === 404
      ? left<NodoErrors, string>("MISSING_PAYMENT_ID")
      : left<NodoErrors, string>("GENERIC_ERROR");
}

/**
 * First do the "attiva" operation then,
 * if successful, poll until a paymentId
 * is available
 */
export async function attivaAndGetPaymentId(
  postAttivaRpt: TypeofApiCall<ActivatePaymentT>,
  getPaymentIdApi: TypeofApiCall<GetActivationStatusT>,
  rptId: RptId,
  paymentContextCode: CodiceContestoPagamento,
  currentAmount: AmountInEuroCents
): Promise<Either<NodoErrors, string>> {
  const attivaRptResult = await attivaRpt(
    postAttivaRpt,
    rptId,
    paymentContextCode,
    currentAmount
  );
  if (attivaRptResult.isLeft()) {
    return left(attivaRptResult.value);
  }
  // FIXME: why we discard the response of Attiva? we should instead update
  //        the transaction info from the data contained in the response

  return await pollForPaymentId(getPaymentIdApi, paymentContextCode);
}

import { call, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { fromNullable } from "fp-ts/lib/Option";
import {
  BpdTransaction,
  BpdTransactions,
  bpdTransactionsLoad,
  CircuitType
} from "../../store/actions/transactions";
import { BackendBpdClient } from "../../api/backendBpdClient";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getError } from "../../../../../utils/errors";
import { AwardPeriodId } from "../../store/actions/periods";
import { BpdWinningTransactions } from "../../../../../../definitions/bpd/winning_transactions/BpdWinningTransactions";
import { HPan } from "../../store/actions/paymentMethods";

/**
 * convert a network circuit into the relative app domain model
 * TODO we don't know which values circuit type could have
 * see https://docs.google.com/document/d/1LNbuPEeqyyt9fsJ8yAOOLQG1xLERO6nOdtlnG95cj74/edit#bookmark=id.nzho5vra0820
 */
const mapNetworkCircuitType: Map<string, CircuitType> = new Map<
  string,
  CircuitType
>([
  ["00", "PagoBancomat"],
  ["01", "Visa"],
  ["02", "Mastercard / Maestro"],
  ["03", "Amex"],
  ["04", "JCB"],
  ["05", "UnionPay"],
  ["06", "Diners"],
  ["07", "PostePay"],
  ["08", "BancomatPay"],
  ["09", "Satispay"],
  ["10", "Private"]
]);

export const convertCircuitTypeCode = (code: string): CircuitType =>
  fromNullable(mapNetworkCircuitType.get(code)).getOrElse("Unknown");

// convert a network payload amount into the relative app domain model
const convertTransactions = (
  networkTransactions: BpdWinningTransactions,
  awardPeriodId: AwardPeriodId
): BpdTransactions => {
  const results = networkTransactions.map<BpdTransaction>(nt => ({
    ...nt,
    hashPan: nt.hashPan as HPan,
    awardPeriodId,
    circuitType: convertCircuitTypeCode(nt.circuitType)
  }));
  return {
    results,
    awardPeriodId
  };
};

/**
 * Networking code to request the transactions for a specified period.
 * @deprecated TODO: remove along with bpdTransactionsPaging FF
 * @param winningTransactions
 * @param action
 */
export function* bpdLoadTransactionsSaga(
  winningTransactions: ReturnType<
    typeof BackendBpdClient
  >["winningTransactions"],
  action: ActionType<typeof bpdTransactionsLoad.request>
) {
  const awardPeriodId = action.payload;
  try {
    const winningTransactionsResult: SagaCallReturnType<
      typeof winningTransactions
    > = yield call(winningTransactions, { awardPeriodId } as any);
    if (winningTransactionsResult.isRight()) {
      if (winningTransactionsResult.value.status === 200) {
        const transactions = convertTransactions(
          winningTransactionsResult.value.value,
          awardPeriodId
        );
        yield put(bpdTransactionsLoad.success(transactions));
      } else {
        throw new Error(
          `response status ${winningTransactionsResult.value.status}`
        );
      }
    } else {
      throw new Error(readableReport(winningTransactionsResult.value));
    }
  } catch (e) {
    yield put(
      bpdTransactionsLoad.failure({ error: getError(e), awardPeriodId })
    );
  }
}

import { delay, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { bpdTransactionsLoad } from "../../store/actions/transactions";

/**
 * Networking code to request the transactions for a specified period.
 * TODO: replace with real code
 * @param action
 */
export function* bpdLoadTransactionsSaga(
  action: ActionType<typeof bpdTransactionsLoad.request>
) {
  yield delay(1000);

  yield put(
    bpdTransactionsLoad.failure({
      awardPeriodId: action.payload,
      error: new Error()
    })
  );

  // yield put(
  //   bpdTransactionsLoad.success({
  //     awardPeriodId: action.payload,
  //     results: [
  //       {
  //         awardPeriodId: action.payload,
  //         amount: 100,
  //         cashback: 10,
  //         circuitType: "Mastercard",
  //         hashPan: "1515" as HPan,
  //         idTrxAcquirer: "123",
  //         idTrxIssuer: "123",
  //         trxDate: new Date()
  //       }
  //     ]
  //   })
  // );
}

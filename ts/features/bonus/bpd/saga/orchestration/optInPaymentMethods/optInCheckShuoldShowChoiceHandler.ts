import { Effect, put, take } from "redux-saga/effects";
import { fetchWalletsRequestWithExpBackoff } from "../../../../../../store/actions/wallet/wallets";
import { bpdAllData } from "../../../store/actions/details";
import { ActionType, getType } from "typesafe-actions";

export function* optInCheckShuoldShowChoiceHandler(): Generator<
  Effect,
  void,
  any
> {
  // Load the information about the participation of the user to the bpd program
  yield put(bpdAllData.request());
  const deleteAllPaymentMethodsByFunctionStatus: ActionType<
    typeof bpdAllData.success | typeof bpdAllData.failure
  > = yield take([getType(bpdAllData.success), getType(bpdAllData.failure)]);
  // If the user is enabled to the bpd check the

  // Load the user payment methods
  yield put(fetchWalletsRequestWithExpBackoff());
}

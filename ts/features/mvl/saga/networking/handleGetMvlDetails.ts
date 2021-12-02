import { delay, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { mvlDetailsLoad } from "../../store/actions";
import { mvlMockData } from "../../types/__mock__/mvlMock";

/**
 * Handle the remote call to retrieve the MVL details
 * TODO: Placeholder stub, implement me!
 * @param _
 * @param __
 */
export function* handleGetMvl(
  // TODO: this will be the backend remote call
  _: unknown,
  __: ActionType<typeof mvlDetailsLoad.request>
) {
  // TODO: remote call -> convert from remote data format to MvlData -> dispatch
  yield delay(125);
  yield put(mvlDetailsLoad.success(mvlMockData));
}

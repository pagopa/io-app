import { delay, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { mvlDetailsLoad } from "../../store/actions";
import { mvlMock } from "../../types/__mock__/mvlMock";

/**
 * Handle the remote call to retrieve the MVL details
 * TODO: Placeholder stub, implement me!
 * @param _
 * @param action
 */
export function* handleGetMvl(
  // TODO: this will be the backend remote call
  _: unknown,
  action: ActionType<typeof mvlDetailsLoad.request>
) {
  // TODO: remote call -> convert from remote data format to MvlData -> dispatch
  yield delay(125);
  const dueDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24);
  yield put(
    mvlDetailsLoad.success({
      ...mvlMock,
      message: {
        ...mvlMock.message,
        serviceId: "service2" as ServiceId,
        dueDate,
        raw: {
          ...mvlMock.message.raw,
          content: {
            ...mvlMock.message.raw.content,
            due_date: dueDate
          }
        }
      },
      id: action.payload
    })
  );
}

import { call, delay, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { mvlDetailsLoad } from "../../store/actions";
import { mvlMock } from "../../types/__mock__/mvlMock";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { BackendMvlClient } from "../../api/backendMvl";
import { LegalMessageWithContent } from "../../../../../definitions/backend/LegalMessageWithContent";
import { Mvl } from "../../types/mvlData";
import { toUIMessageDetails } from "../../../../store/reducers/entities/messages/transformers";

const convertMvlDetail = (payload: LegalMessageWithContent): Mvl => {
  return {
    message: toUIMessageDetails(payload.content),
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
  };
};

/**
 * Handle the remote call to retrieve the MVL details
 * TODO: Placeholder stub, implement me!
 * @param getUserLegalMessage
 * @param action
 */
export function* handleGetMvl(
  getUserLegalMessage: BackendMvlClient["getUserLegalMessage"],
  action: ActionType<typeof mvlDetailsLoad.request>
) {
  try {
    const getUserLegalMessageRequest: SagaCallReturnType<
      typeof getUserLegalMessage
    > = yield call(getUserLegalMessage, { id: action.payload });
    if (getUserLegalMessageRequest.isRight()) {
      if (getUserLegalMessageRequest.value.status === 200) {
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
        return;
      }
      // != 200
      yield put(
        mvlDetailsLoad.failure({
          ...getGenericError(
            new Error(
              `response status ${getUserLegalMessageRequest.value.status}`
            )
          ),
          id: action.payload
        })
      );
    } else {
      yield put(
        mvlDetailsLoad.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getUserLegalMessageRequest.value))
          ),
          id: action.payload
        })
      );
    }
  } catch (e) {
    yield put(
      mvlDetailsLoad.failure({ ...getNetworkError(e), id: action.payload })
    );
  }
}

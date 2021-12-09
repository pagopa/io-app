import { ContentClient } from "../../../../api/content";
import { SagaCallReturnType } from "../../../../types/utils";
import { call, put } from "redux-saga/effects";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { getZendeskConfig } from "../../store/actions";

export function* handleGetZendeskConfig(
  getZendeskConfigClient: ReturnType<typeof ContentClient>["getZendeskConfig"]
) {
  try {
    const getZendeskConfigResult: SagaCallReturnType<
      typeof getZendeskConfigClient
    > = yield call(getZendeskConfigClient);
    if (getZendeskConfigResult.isRight()) {
      if (getZendeskConfigResult.value.status === 200) {
        yield put(getZendeskConfig.success(getZendeskConfigResult.value.value));
      } else {
        throw new Error(
          `response status ${getZendeskConfigResult.value.status}`
        );
      }
    } else {
      throw new Error(readablePrivacyReport(getZendeskConfigResult.value));
    }
  } catch (e) {
    yield put(getZendeskConfig.failure(e));
  }
}

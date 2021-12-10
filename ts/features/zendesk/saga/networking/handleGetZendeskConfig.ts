import { call, put } from "redux-saga/effects";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { ContentClient } from "../../../../api/content";
import { SagaCallReturnType } from "../../../../types/utils";
import { getZendeskConfig } from "../../store/actions";
import { getGenericError, getNetworkError } from "../../../../utils/errors";

// retrieve the zendesk config from the CDN
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
        yield put(
          getZendeskConfig.failure(
            getGenericError(
              Error(`response status ${getZendeskConfigResult.value.status}`)
            )
          )
        );
      }
    } else {
      getZendeskConfig.failure(
        getGenericError(Error(readableReport(getZendeskConfigResult.value)))
      );
    }
  } catch (e) {
    yield put(getZendeskConfig.failure(getNetworkError(e)));
  }
}

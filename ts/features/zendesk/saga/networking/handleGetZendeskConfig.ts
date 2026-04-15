import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ContentClient } from "../../../../api/content";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { getZendeskConfig } from "../../store/actions";

// retrieve the zendesk config from the CDN
export function* handleGetZendeskConfig(
  getZendeskConfigClient: ReturnType<typeof ContentClient>["getZendeskConfig"]
) {
  try {
    const getZendeskConfigResult: SagaCallReturnType<
      typeof getZendeskConfigClient
    > = yield* call(getZendeskConfigClient);
    if (E.isRight(getZendeskConfigResult)) {
      if (getZendeskConfigResult.right.status === 200) {
        yield* put(
          getZendeskConfig.success(getZendeskConfigResult.right.value)
        );
      } else {
        yield* put(
          getZendeskConfig.failure(
            getGenericError(
              Error(`response status ${getZendeskConfigResult.right.status}`)
            )
          )
        );
      }
    } else {
      getZendeskConfig.failure(
        getGenericError(Error(readableReport(getZendeskConfigResult.left)))
      );
    }
  } catch (e) {
    yield* put(getZendeskConfig.failure(getNetworkError(e)));
  }
}

import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ContentClient } from "../../../../api/content";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { getZendeskPaymentConfig } from "../../store/actions";

// retrieve the zendesk config from the CDN
export function* handleGetZendeskPaymentConfig(
  getZendeskPaymentConfigClient: ReturnType<
    typeof ContentClient
  >["getZendeskPaymentConfig"]
) {
  try {
    const getZendeskPaymentConfigResult: SagaCallReturnType<
      typeof getZendeskPaymentConfigClient
    > = yield* call(getZendeskPaymentConfigClient);
    if (E.isRight(getZendeskPaymentConfigResult)) {
      if (getZendeskPaymentConfigResult.right.status === 200) {
        yield* put(
          getZendeskPaymentConfig.success(
            getZendeskPaymentConfigResult.right.value
          )
        );
      } else {
        yield* put(
          getZendeskPaymentConfig.failure(
            getGenericError(
              Error(
                `response status ${getZendeskPaymentConfigResult.right.status}`
              )
            )
          )
        );
      }
    } else {
      getZendeskPaymentConfig.failure(
        getGenericError(
          Error(readableReport(getZendeskPaymentConfigResult.left))
        )
      );
    }
  } catch (e) {
    yield* put(getZendeskPaymentConfig.failure(getNetworkError(e)));
  }
}

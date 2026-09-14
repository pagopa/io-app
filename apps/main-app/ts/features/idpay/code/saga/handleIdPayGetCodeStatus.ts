import { err, ok } from "neverthrow";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";

import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { IDPayClient } from "../../common/api/client";
import { idPayGetCodeStatus } from "../store/actions";

export function* handleIdPayGetCodeStatus(
  getIdpayCodeStatus: IDPayClient["getIdpayCodeStatus"],
  bearerToken: string,
  action: ActionType<(typeof idPayGetCodeStatus)["request"]>
) {
  const getIdpayCodeStatusRequest = getIdpayCodeStatus({
    bearerAuth: bearerToken
  });

  try {
    const getIdpayCodeStatusResult = (yield* call(
      withRefreshApiCall,
      getIdpayCodeStatusRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getIdpayCodeStatus>;

    yield (
      "isOk" in getIdpayCodeStatusResult
        ? getIdpayCodeStatusResult
        : "right" in getIdpayCodeStatusResult
          ? ok(getIdpayCodeStatusResult.right)
          : err(getIdpayCodeStatusResult.left)
    ).match(
      response =>
        put(
          response.status === 200
            ? idPayGetCodeStatus.success(response.value)
            : idPayGetCodeStatus.failure({
                ...getGenericError(
                  new Error(`response status code ${response.status}`)
                )
              })
        ),
      error =>
        put(
          idPayGetCodeStatus.failure({
            ...getGenericError(new Error(readablePrivacyReport(error)))
          })
        )
    );
  } catch (e) {
    yield* put(idPayGetCodeStatus.failure({ ...getNetworkError(e) }));
  }
}

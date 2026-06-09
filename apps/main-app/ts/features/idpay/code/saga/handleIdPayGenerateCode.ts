import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";

import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import {
  RefreshThirdPartyApiCallOptions,
  withThirdPartyRefreshApiCall
} from "../../../authentication/fastLogin/saga/utils";
import { IDPayClient } from "../../common/api/client";
import { idPayGenerateCode } from "../store/actions";

export function* handleIdPayGenerateCode(
  generateCode: IDPayClient["generateCode"],
  bearerToken: string,
  action: ActionType<(typeof idPayGenerateCode)["request"]>
) {
  const idPayGenerateCodeRequest = generateCode({
    bearerAuth: bearerToken,
    body: action.payload
  });

  try {
    const idPayGenerateCodeResult = (yield* call(
      withThirdPartyRefreshApiCall,
      idPayGenerateCodeRequest,
      { action } as RefreshThirdPartyApiCallOptions
    )) as unknown as SagaCallReturnType<typeof generateCode>;

    yield pipe(
      idPayGenerateCodeResult,
      E.fold(
        error =>
          put(
            idPayGenerateCode.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            })
          ),
        response =>
          put(
            response.status === 200
              ? idPayGenerateCode.success(response.value)
              : idPayGenerateCode.failure({
                  ...getGenericError(
                    new Error(`response status code ${response.status}`)
                  )
                })
          )
      )
    );
  } catch (e) {
    yield* put(idPayGenerateCode.failure({ ...getNetworkError(e) }));
  }
}

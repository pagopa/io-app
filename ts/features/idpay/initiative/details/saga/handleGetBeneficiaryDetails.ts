import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { IDPayClient } from "../../../common/api/client";
import {
  idPayBeneficiaryDetailsGet,
  IdPayBeneficiaryDetailsGetPayloadType
} from "../store/actions";

export function* handleGetBeneficiaryDetails(
  getInitiativeBeneficiaryDetail: IDPayClient["getInitiativeBeneficiaryDetail"],
  token: string,
  language: PreferredLanguageEnum,
  payload: IdPayBeneficiaryDetailsGetPayloadType
) {
  try {
    const getInitiativeBeneficiaryResult: SagaCallReturnType<
      typeof getInitiativeBeneficiaryDetail
    > = yield* call(getInitiativeBeneficiaryDetail, {
      bearerAuth: token,
      "Accept-Language": language,
      initiativeId: payload.initiativeId
    });
    yield pipe(
      getInitiativeBeneficiaryResult,
      E.fold(
        error =>
          put(
            idPayBeneficiaryDetailsGet.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            })
          ),
        response =>
          put(
            response.status === 200
              ? idPayBeneficiaryDetailsGet.success(response.value)
              : idPayBeneficiaryDetailsGet.failure({
                  ...getGenericError(
                    new Error(`response status code ${response.status}`)
                  )
                })
          )
      )
    );
  } catch (e) {
    yield* put(idPayBeneficiaryDetailsGet.failure({ ...getNetworkError(e) }));
  }
}

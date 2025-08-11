import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { InitiativeDetailDTO } from "../../../../../../definitions/idpay/InitiativeDetailDTO";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { idPayBeneficiaryDetailsGet } from "../../store/actions";
import { handleGetBeneficiaryDetails } from "../handleGetBeneficiaryDetails";

describe("idPayBeneficiaryDetailsGet", () => {
  const initiativeId = "abcdef";

  const initiativeDetails: InitiativeDetailDTO = {
    initiativeName: "initiativeName"
  };

  describe("when the response is successful", () => {
    it(`should put ${getType(
      idPayBeneficiaryDetailsGet.success
    )} with the initiative beneficiary details`, () => {
      const getInitiativeBeneficiaryDetail = jest.fn();
      testSaga(
        handleGetBeneficiaryDetails,
        getInitiativeBeneficiaryDetail,
        "bpdToken",
        PreferredLanguageEnum.it_IT,
        idPayBeneficiaryDetailsGet.request({ initiativeId })
      )
        .next()
        .call(
          withRefreshApiCall,
          getInitiativeBeneficiaryDetail({
            initiativeId
          }),
          idPayBeneficiaryDetailsGet.request({ initiativeId })
        )
        .next(E.right({ status: 200, value: initiativeDetails }))
        .put(idPayBeneficiaryDetailsGet.success(initiativeDetails))
        .next()
        .isDone();
    });
  });

  describe("when the response is an Error", () => {
    const statusCode = 500;

    it(`should put ${getType(
      idPayBeneficiaryDetailsGet.failure
    )} with the error`, () => {
      const getInitiativeBeneficiaryDetail = jest.fn();
      testSaga(
        handleGetBeneficiaryDetails,
        getInitiativeBeneficiaryDetail,
        "bpdToken",
        PreferredLanguageEnum.it_IT,
        idPayBeneficiaryDetailsGet.request({ initiativeId })
      )
        .next()
        .call(
          withRefreshApiCall,
          getInitiativeBeneficiaryDetail({
            initiativeId
          }),
          idPayBeneficiaryDetailsGet.request({ initiativeId })
        )
        .next(
          E.right({
            status: statusCode,
            value: { code: statusCode, message: "error" }
          })
        )
        .put(
          idPayBeneficiaryDetailsGet.failure({
            kind: "generic",
            value: new Error(`response status code ${statusCode}`)
          })
        )
        .next()
        .isDone();
    });
  });
});

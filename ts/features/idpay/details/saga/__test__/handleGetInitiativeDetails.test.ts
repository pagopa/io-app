import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import {
  InitiativeDTO,
  StatusEnum as InitiativeStatusEnum
} from "../../../../../../definitions/idpay/InitiativeDTO";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { idpayInitiativeGet } from "../../store/actions";
import { handleGetInitiativeDetails } from "../handleGetInitiativeDetails";

describe("idpayInitiativeGet", () => {
  const initiativeId = "abcdef";

  const initiative = {
    initiativeId,
    initiativeName: "initiativeName",
    voucherEndDate: new Date(2023, 1, 1),
    nInstr: 1,
    status: InitiativeStatusEnum.REFUNDABLE
  } as InitiativeDTO;

  describe("when the response is successful", () => {
    it(`should put ${getType(
      idpayInitiativeGet.success
    )} with the initiative details`, () => {
      const getInitiativeDetails = jest.fn();
      testSaga(
        handleGetInitiativeDetails,
        getInitiativeDetails,
        "bpdToken",
        PreferredLanguageEnum.it_IT,
        idpayInitiativeGet.request({ initiativeId })
      )
        .next()
        .call(
          withRefreshApiCall,
          getInitiativeDetails({
            initiativeId
          }),
          idpayInitiativeGet.request({ initiativeId })
        )
        .next(E.right({ status: 200, value: initiative }))
        .put(idpayInitiativeGet.success(initiative))
        .next()
        .isDone();
    });
  });

  describe("when the response is an Error", () => {
    const statusCode = 500;

    it(`should put ${getType(
      idpayInitiativeGet.failure
    )} with the error`, () => {
      const getInitiativeBeneficiaryDetail = jest.fn();
      testSaga(
        handleGetInitiativeDetails,
        getInitiativeBeneficiaryDetail,
        "bpdToken",
        PreferredLanguageEnum.it_IT,
        idpayInitiativeGet.request({ initiativeId })
      )
        .next()
        .call(
          withRefreshApiCall,
          getInitiativeBeneficiaryDetail({
            initiativeId
          }),
          idpayInitiativeGet.request({ initiativeId })
        )
        .next(
          E.right({
            status: statusCode,
            value: { code: statusCode, message: "error" }
          })
        )
        .put(
          idpayInitiativeGet.failure({
            kind: "generic",
            value: new Error(`response status code ${statusCode}`)
          })
        )
        .next()
        .isDone();
    });
  });
});

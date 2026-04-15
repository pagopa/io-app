import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { getGenericError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withThirdPartyRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { idPayGenerateCode } from "../../store/actions";
import { handleIdPayGenerateCode } from "../handleIdPayGenerateCode";

const tInitiativeId = "123abc";
const tBearerToken = "12345678";
const tIdPayCode = "12345";

describe("handleIdPayGenerateCode", () => {
  describe("when the response is successful", () => {
    it(`should put ${getType(idPayGenerateCode.success)}`, () => {
      const generateCode = jest.fn();
      testSaga(
        handleIdPayGenerateCode,
        generateCode,
        tBearerToken,
        idPayGenerateCode.request({ initiativeId: tInitiativeId })
      )
        .next()
        .call(
          withThirdPartyRefreshApiCall,
          generateCode({
            bearerAuth: tBearerToken,
            initiativeId: tInitiativeId
          }),
          { action: idPayGenerateCode.request({ initiativeId: tInitiativeId }) }
        )
        .next(E.right({ status: 200, value: { idpayCode: tIdPayCode } }))
        .put(idPayGenerateCode.success({ idpayCode: tIdPayCode }))
        .next()
        .isDone();
    });
  });
  describe("when the response is not successful", () => {
    it(`should put ${getType(
      idPayGenerateCode.failure
    )} with the error`, () => {
      const generateCode = jest.fn();
      testSaga(
        handleIdPayGenerateCode,
        generateCode,
        tBearerToken,
        idPayGenerateCode.request({ initiativeId: tInitiativeId })
      )
        .next()
        .call(
          withThirdPartyRefreshApiCall,
          generateCode({
            bearerAuth: tBearerToken,
            initiativeId: tInitiativeId
          }),
          { action: idPayGenerateCode.request({ initiativeId: tInitiativeId }) }
        )
        .next(E.right({ status: 500 }))
        .put(
          idPayGenerateCode.failure({
            ...getGenericError(new Error(`response status code 500`))
          })
        )
        .next()
        .isDone();
    });
  });
  describe("when the request fails", () => {
    it(`should put ${getType(
      idPayGenerateCode.failure
    )} with the error`, () => {
      const generateCode = jest.fn();
      testSaga(
        handleIdPayGenerateCode,
        generateCode,
        tBearerToken,
        idPayGenerateCode.request({ initiativeId: tInitiativeId })
      )
        .next()
        .call(
          withThirdPartyRefreshApiCall,
          generateCode({
            bearerAuth: tBearerToken,
            initiativeId: tInitiativeId
          }),
          { action: idPayGenerateCode.request({ initiativeId: tInitiativeId }) }
        )
        .next(E.left([]))
        .put(
          idPayGenerateCode.failure({
            ...getGenericError(new Error(readablePrivacyReport([])))
          })
        )
        .next()
        .isDone();
    });
  });
});

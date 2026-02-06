import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";

import { getGenericError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { idPayEnrollCode } from "../../store/actions";
import { handleIdPayEnrollCode } from "../handleIdPayEnrollCode";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/identity/PreferredLanguage";

const tInitiativeId = "123abc";
const tBearerToken = "12345678";
const tAcceptLanguage = PreferredLanguageEnum.it_IT;

describe("handleIdPayEnrollCode", () => {
  describe("when the response is successful", () => {
    it(`should put ${getType(idPayEnrollCode.success)}`, () => {
      const enrollInstrumentCode = jest.fn();
      testSaga(
        handleIdPayEnrollCode,
        enrollInstrumentCode,
        tBearerToken,
        tAcceptLanguage,
        idPayEnrollCode.request({ initiativeId: tInitiativeId })
      )
        .next()
        .call(
          withRefreshApiCall,
          enrollInstrumentCode({
            bearerAuth: tBearerToken,
            "Accept-Language": tAcceptLanguage,
            initiativeId: tInitiativeId
          }),
          idPayEnrollCode.request({ initiativeId: tInitiativeId })
        )
        .next(E.right({ status: 200 }))
        .put(idPayEnrollCode.success())
        .next()
        .isDone();
    });
  });
  describe("when the response is not successful", () => {
    it(`should put ${getType(idPayEnrollCode.failure)} with the error`, () => {
      const enrollInstrumentCode = jest.fn();
      testSaga(
        handleIdPayEnrollCode,
        enrollInstrumentCode,
        tBearerToken,
        tAcceptLanguage,
        idPayEnrollCode.request({ initiativeId: tInitiativeId })
      )
        .next()
        .call(
          withRefreshApiCall,
          enrollInstrumentCode({
            bearerAuth: tBearerToken,
            "Accept-Language": tAcceptLanguage,
            initiativeId: tInitiativeId
          }),
          idPayEnrollCode.request({ initiativeId: tInitiativeId })
        )
        .next(E.right({ status: 500 }))
        .put(
          idPayEnrollCode.failure({
            ...getGenericError(new Error(`response status code 500`))
          })
        )
        .next()
        .isDone();
    });
  });
  describe("when the request fails", () => {
    it(`should put ${getType(idPayEnrollCode.failure)} with the error`, () => {
      const enrollInstrumentCode = jest.fn();
      testSaga(
        handleIdPayEnrollCode,
        enrollInstrumentCode,
        tBearerToken,
        tAcceptLanguage,
        idPayEnrollCode.request({ initiativeId: tInitiativeId })
      )
        .next()
        .call(
          withRefreshApiCall,
          enrollInstrumentCode({
            bearerAuth: tBearerToken,
            "Accept-Language": tAcceptLanguage,
            initiativeId: tInitiativeId
          }),
          idPayEnrollCode.request({ initiativeId: tInitiativeId })
        )
        .next(E.left([]))
        .put(
          idPayEnrollCode.failure({
            ...getGenericError(new Error(readablePrivacyReport([])))
          })
        )
        .next()
        .isDone();
    });
  });
});

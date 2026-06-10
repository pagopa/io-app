import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { getGenericError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { idPayGetCodeStatus } from "../../store/actions";
import { handleIdPayGetCodeStatus } from "../handleIdPayGetCodeStatus";

const tInitiativeId = "123abc";
const tBearerToken = "12345678";

describe("handleIdPayGetCodeStatus", () => {
  describe("when the response is successful", () => {
    it(`should put ${getType(idPayGetCodeStatus.success)}`, () => {
      const getIdpayCodeStatus = jest.fn();
      testSaga(
        handleIdPayGetCodeStatus,
        getIdpayCodeStatus,
        tBearerToken,
        idPayGetCodeStatus.request()
      )
        .next()
        .call(
          withRefreshApiCall,
          getIdpayCodeStatus({
            bearerAuth: tBearerToken,
            initiativeId: tInitiativeId
          }),
          idPayGetCodeStatus.request()
        )
        .next(E.right({ status: 200, value: { isIdPayCodeEnabled: true } }))
        .put(idPayGetCodeStatus.success({ isIdPayCodeEnabled: true }))
        .next()
        .isDone();
    });
  });
  describe("when the response is not successful", () => {
    it(`should put ${getType(
      idPayGetCodeStatus.failure
    )} with the error`, () => {
      const getIdpayCodeStatus = jest.fn();
      testSaga(
        handleIdPayGetCodeStatus,
        getIdpayCodeStatus,
        tBearerToken,
        idPayGetCodeStatus.request()
      )
        .next()
        .call(
          withRefreshApiCall,
          getIdpayCodeStatus({
            bearerAuth: tBearerToken,
            initiativeId: tInitiativeId
          }),
          idPayGetCodeStatus.request()
        )
        .next(E.right({ status: 500 }))
        .put(
          idPayGetCodeStatus.failure({
            ...getGenericError(new Error(`response status code 500`))
          })
        )
        .next()
        .isDone();
    });
  });
  describe("when the request fails", () => {
    it(`should put ${getType(
      idPayGetCodeStatus.failure
    )} with the error`, () => {
      const getIdpayCodeStatus = jest.fn();
      testSaga(
        handleIdPayGetCodeStatus,
        getIdpayCodeStatus,
        tBearerToken,
        idPayGetCodeStatus.request()
      )
        .next()
        .call(
          withRefreshApiCall,
          getIdpayCodeStatus({
            bearerAuth: tBearerToken,
            initiativeId: tInitiativeId
          }),
          idPayGetCodeStatus.request()
        )
        .next(E.left([]))
        .put(
          idPayGetCodeStatus.failure({
            ...getGenericError(new Error(readablePrivacyReport([])))
          })
        )
        .next()
        .isDone();
    });
  });
});

import { testSaga } from "redux-saga-test-plan";
import { take, delay } from "redux-saga/effects";
import { testTotalNewResponsesFunction } from "../handleGetTotalNewResponses";
import {
  logoutRequest,
  sessionExpired,
  sessionInformationLoadSuccess,
  sessionInvalid
} from "../../../../../store/actions/authentication";
import MockZendesk from "../../../../../__mocks__/io-react-native-zendesk";
import {
  getIdentityByToken,
  setUserIdentity,
  unreadTicketsCountRefreshRate,
  unreadTicketsCountRefreshRateWhileSupportIsOpen,
  zendeskDefaultAnonymousConfig,
  zendeskDefaultJwtConfig
} from "../../../../../utils/supportAssistance";
import { zendeskTokenSelector } from "../../../../../store/reducers/authentication";
import {
  zendeskGetTotalNewResponses,
  zendeskRequestTicketNumber,
  zendeskSupportOpened
} from "../../../store/actions";
import { getError } from "../../../../../utils/errors";
import {
  versionInfoLoadFailure,
  versionInfoLoadSuccess
} from "../../../../../common/versionInfo/store/actions/versionInfo";
import { backendStatusLoadSuccess } from "../../../../../store/actions/backendStatus";
import { BackendStatus } from "../../../../../../definitions/content/BackendStatus";
import { IOVersionInfo } from "../../../../../common/versionInfo/types/IOVersionInfo";

jest.useFakeTimers();

describe("setupZendesk", function () {
  it("when the token is undefined should call the initSupportAssistance and the getIdentityByToken with the zendeskDefaultAnonymousConfig and the AnonymousIdentity", () => {
    if (testTotalNewResponsesFunction) {
      testSaga(testTotalNewResponsesFunction.setupZendesk)
        .next()
        .select(zendeskTokenSelector)
        .next(undefined)
        .call(MockZendesk.init, zendeskDefaultAnonymousConfig)
        .next()
        .call(getIdentityByToken, undefined)
        .next({})
        .call(setUserIdentity, {});
    }
  });
  it("when the token is defined should call the initSupportAssistance and the getIdentityByToken with the zendeskDefaultJwtConfig, plus the token, and the JwtIdentity ", () => {
    if (testTotalNewResponsesFunction) {
      const mockedToken = "mockedToken";
      const mockedJwtConfig = {
        ...zendeskDefaultJwtConfig,
        token: mockedToken
      };
      testSaga(testTotalNewResponsesFunction.setupZendesk)
        .next()
        .select(zendeskTokenSelector)
        .next("mockedToken")
        .call(MockZendesk.init, mockedJwtConfig)
        .next()
        .call(getIdentityByToken, mockedToken)
        .next({
          token: mockedToken
        })
        .call(setUserIdentity, {
          token: mockedToken
        });
    }
  });
});
describe("getTicketsCount", () => {
  it("should call the setupZendesk and dispatch the zendeskRequestTicketNumber.request action", () => {
    if (testTotalNewResponsesFunction) {
      testSaga(testTotalNewResponsesFunction.getTicketsCount)
        .next()
        .call(testTotalNewResponsesFunction.setupZendesk)
        .next()
        .put(zendeskRequestTicketNumber.request());
    }
  });
});
describe("getUnreadTicketsCount", () => {
  it("should call the setupZendesk, the getTotalNewResponses functions and dispatch the zendeskGetTotalNewResponses.success action if no exception is thrown", () => {
    const mockedGetTotalNewResponses = 5;
    if (testTotalNewResponsesFunction) {
      testSaga(testTotalNewResponsesFunction.getUnreadTicketsCount)
        .next()
        .call(testTotalNewResponsesFunction.setupZendesk)
        .next()
        .call(MockZendesk.getTotalNewResponses)
        .next(mockedGetTotalNewResponses)
        .put(zendeskGetTotalNewResponses.success(mockedGetTotalNewResponses));
    }
  });
  it("should call the setupZendesk and the getTotalNewResponses functions and dispatch the zendeskGetTotalNewResponses.failure action if an exception is thrown", () => {
    const mockedException = new Error();
    if (testTotalNewResponsesFunction) {
      testSaga(testTotalNewResponsesFunction.getUnreadTicketsCount)
        .next()
        .call(testTotalNewResponsesFunction.setupZendesk)
        .next()
        .call(MockZendesk.getTotalNewResponses)
        .throw(mockedException)
        .put(zendeskGetTotalNewResponses.failure(getError(mockedException)));
    }
  });
});
describe("refreshUnreadTicketsCountWhileSupportIsOpen", () => {
  it("should take the zendeskSupportOpened action, call the getUnreadTicketsCount function, and if the race is won by a stoppersPredicate should exit", () => {
    if (testTotalNewResponsesFunction) {
      testSaga(
        testTotalNewResponsesFunction.refreshUnreadTicketsCountWhileSupportIsOpen
      )
        .next()
        .take(zendeskSupportOpened)
        .next()
        .call(testTotalNewResponsesFunction.getUnreadTicketsCount)
        .next()
        .race({
          wait: delay(unreadTicketsCountRefreshRateWhileSupportIsOpen),
          stoppers: take(testTotalNewResponsesFunction.stoppersPredicate)
        })
        .next({ stoppers: versionInfoLoadFailure });
    }
  });
});
describe("refreshUnreadTicketsCount", () => {
  it("should call the getUnreadTicketsCount and the getTicketsCount functions, and set a race", () => {
    if (testTotalNewResponsesFunction) {
      testSaga(testTotalNewResponsesFunction.refreshUnreadTicketsCount)
        .next()
        .call(testTotalNewResponsesFunction.getUnreadTicketsCount)
        .next()
        .call(testTotalNewResponsesFunction.getTicketsCount)
        .next()
        .race({
          wait: delay(unreadTicketsCountRefreshRate),
          signals: take([
            sessionInvalid,
            sessionExpired,
            logoutRequest,
            sessionInformationLoadSuccess
          ])
        });
    }
  });
});
describe("handleGetTotalNewResponses", () => {
  it("should fork the refreshUnreadTicketsCount and the refreshUnreadTicketsCountWhileSupportIsOpen sagas", () => {
    if (testTotalNewResponsesFunction) {
      testSaga(testTotalNewResponsesFunction.handleGetTotalNewResponses)
        .next()
        .fork(testTotalNewResponsesFunction.refreshUnreadTicketsCount)
        .next()
        .fork(
          testTotalNewResponsesFunction.refreshUnreadTicketsCountWhileSupportIsOpen
        );
    }
  });
});

describe("stoppersPredicate", () => {
  [
    zendeskGetTotalNewResponses.request(),
    zendeskGetTotalNewResponses.success(1),
    zendeskGetTotalNewResponses.failure(new Error()),
    zendeskRequestTicketNumber.request(),
    zendeskRequestTicketNumber.failure(new Error()),
    zendeskRequestTicketNumber.success(1),
    backendStatusLoadSuccess({} as BackendStatus),
    versionInfoLoadFailure(new Error()),
    versionInfoLoadSuccess({} as IOVersionInfo)
  ].forEach(action => {
    it(`should return false if the action is ${action.type}`, () => {
      if (testTotalNewResponsesFunction) {
        expect(
          testTotalNewResponsesFunction.stoppersPredicate(action)
        ).toBeFalsy();
      }
    });
  });
});

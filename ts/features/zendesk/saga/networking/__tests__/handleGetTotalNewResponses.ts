import { testSaga } from "redux-saga-test-plan";
import { take } from "redux-saga/effects";
import { delay } from "@redux-saga/core/effects";
import { testTotalNewResponsesFunction } from "../handleGetTotalNewResponses";
import MockZendesk from "../../../../../__mocks__/io-react-native-zendesk";
import { zendeskTokenSelector } from "../../../../../store/reducers/authentication";
import {
  zendeskGetTotalNewResponses,
  zendeskRequestTicketNumber
} from "../../../store/actions";
import {
  AnonymousIdentity,
  getTotalNewResponsesRefreshRate,
  initSupportAssistance,
  JwtIdentity,
  ZendeskAppConfig,
  zendeskDefaultAnonymousConfig,
  zendeskDefaultJwtConfig
} from "../../../../../utils/supportAssistance";
import {
  logoutRequest,
  sessionExpired,
  sessionInformationLoadSuccess,
  sessionInvalid
} from "../../../../../store/actions/authentication";

const mockedAnonymousIdentity: AnonymousIdentity = {};
const mockedZendeskToken = "mockedToken";
const configurations: ReadonlyArray<
  [
    zendeskToken: string | undefined,
    zendeskConfig: ZendeskAppConfig,
    zendeskIdentity: JwtIdentity | AnonymousIdentity
  ]
> = [
  [undefined, zendeskDefaultAnonymousConfig, mockedAnonymousIdentity],
  [
    mockedZendeskToken,
    { ...zendeskDefaultJwtConfig, token: mockedZendeskToken },
    {
      token: mockedZendeskToken
    }
  ]
];

describe("totalNewResponsesFunction saga", () => {
  jest.useFakeTimers();

  test.each(configurations)(
    "If the zendeskToken is %p, the zendeskConfig is %p and the zendeskIdentity is %p, the saga should put the zendeskGetTotalNewResponses.success action",
    (zendeskToken, zendeskConfig, zendeskIdentity) => {
      if (testTotalNewResponsesFunction) {
        testSaga(testTotalNewResponsesFunction)
          .next()
          .select(zendeskTokenSelector)
          .next(zendeskToken)
          .call(initSupportAssistance, zendeskConfig)
          .next()
          .call(MockZendesk.setUserIdentity, zendeskIdentity)
          .next()
          .put(zendeskRequestTicketNumber.request())
          .next()
          .call(MockZendesk.getTotalNewResponses)
          .next(5)
          .put(zendeskGetTotalNewResponses.success(5))
          .next()
          .race({
            wait: delay(getTotalNewResponsesRefreshRate),
            signals: take([
              sessionInvalid,
              sessionExpired,
              logoutRequest,
              sessionInformationLoadSuccess
            ])
          })
          .next()
          .isDone();
      }
    }
  );
});

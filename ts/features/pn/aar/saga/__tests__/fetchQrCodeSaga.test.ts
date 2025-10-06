import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { isPnTestEnabledSelector } from "../../../../../store/reducers/persistedPreferences";
import { SessionToken } from "../../../../../types/SessionToken";
import { SendAARClient } from "../../api/client";
import { setAarFlowState } from "../../store/actions";
import { currentAARFlowData } from "../../store/reducers";
import { AARFlowState, sendAARFlowStates } from "../../utils/stateUtils";
import { fetchAARQrCodeSaga } from "../fetchQrCodeSaga";

const sendUATEnvironment = [false, true];

describe("fetchQrCodeSaga", () => {
  const aQRCode = "TESTTEST";
  const sessionToken: SessionToken = "test-session-token" as SessionToken;
  const getMockKoState = (prevState: AARFlowState): AARFlowState => ({
    type: "ko",
    previousState: { ...prevState }
  });
  const mockFetchingQrState: AARFlowState = {
    type: "fetchingQRData",
    qrCode: aQRCode
  };
  const mockTosState: AARFlowState = {
    type: "displayingAARToS",
    qrCode: aQRCode
  };

  const mockResolvedCall = (resolved: any) =>
    new Promise((res, _reject) => res(resolved)) as unknown as ReturnType<
      SendAARClient["aarQRCodeCheck"]
    >;

  const mockFetchQrCode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  sendUATEnvironment.forEach(isSendUATEnvironment =>
    it(`should correctly update state on a 200 response with isTest='${isPnTestEnabledSelector}'`, () => {
      const successState: AARFlowState = {
        type: sendAARFlowStates.fetchingNotificationData,
        iun: "123123",
        fullNameDestinatario: "nomecognome"
      };
      const successResponse = E.right({
        headers: {},
        status: 200,
        value: {
          iun: "123123",
          recipientInfo: {
            denomination: "nomecognome",
            taxId: "taxID"
          }
        }
      });
      const mockApiCall = () => mockResolvedCall(successResponse);

      testSaga(fetchAARQrCodeSaga, aQRCode, mockApiCall, sessionToken)
        .next()
        .select(currentAARFlowData)
        .next(mockFetchingQrState)
        .select(isPnTestEnabledSelector)
        .next(isSendUATEnvironment)
        .call(mockApiCall, {
          Bearer: sessionToken,
          body: {
            aarQrCodeValue: aQRCode
          },
          isTest: isSendUATEnvironment
        })
        .next(successResponse)
        .put(setAarFlowState(successState))
        .next()
        .isDone();
    })
  );

  sendUATEnvironment.forEach(isSendUATEnvironment =>
    it(`should correctly update state on a 403 response with isTest='${isSendUATEnvironment}'`, () => {
      const notAddresseeState: AARFlowState = {
        type: sendAARFlowStates.notAddresseeFinal,
        iun: "123123",
        fullNameDestinatario: "nomecognome",
        qrCode: aQRCode
      };
      const notAddresseeResponse = E.right({
        headers: {},
        status: 403,
        value: {
          iun: "123123",
          recipientInfo: {
            denomination: "nomecognome",
            taxId: "taxID"
          }
        }
      });

      const mockApiCall = () => mockResolvedCall(notAddresseeResponse);

      testSaga(fetchAARQrCodeSaga, aQRCode, mockApiCall, sessionToken)
        .next()
        .select(currentAARFlowData)
        .next(mockFetchingQrState)
        .select(isPnTestEnabledSelector)
        .next(isSendUATEnvironment)
        .call(mockApiCall, {
          Bearer: sessionToken,
          body: {
            aarQrCodeValue: aQRCode
          },
          isTest: isSendUATEnvironment
        })
        .next(notAddresseeResponse)
        .put(setAarFlowState(notAddresseeState))
        .next()
        .isDone();
    })
  );

  sendUATEnvironment.forEach(isSendUATEnvironment =>
    [
      (E.left(undefined),
      E.right({ status: 500, value: undefined }),
      E.right({ status: 418, value: undefined }))
    ].forEach(res =>
      it(`should dispatch KO state on a response of ${JSON.stringify(
        res
      )} with isTest='${isSendUATEnvironment}'`, () => {
        testSaga(fetchAARQrCodeSaga, aQRCode, mockFetchQrCode, sessionToken)
          .next()
          .select(currentAARFlowData)
          .next(mockFetchingQrState)
          .select(isPnTestEnabledSelector)
          .next(isSendUATEnvironment)
          .call(mockFetchQrCode, {
            Bearer: sessionToken,
            body: {
              aarQrCodeValue: aQRCode
            },
            isTest: isSendUATEnvironment
          })
          .next(res)
          .put(setAarFlowState(getMockKoState(mockFetchingQrState)))
          .next()
          .isDone();
      })
    )
  );

  it("should exit early if the current state is wrong", () => {
    testSaga(fetchAARQrCodeSaga, aQRCode, mockFetchQrCode, sessionToken)
      .next()
      .select(currentAARFlowData)
      .next(mockTosState)
      .isDone();
  });
  sendUATEnvironment.forEach(isSendUATEnvironment =>
    it(`should dispatch KO state on exception throw with isTest='${isSendUATEnvironment}'`, () => {
      testSaga(fetchAARQrCodeSaga, aQRCode, mockFetchQrCode, sessionToken)
        .next()
        .select(currentAARFlowData)
        .next(mockFetchingQrState)
        .select(isPnTestEnabledSelector)
        .next(isSendUATEnvironment)
        .call(mockFetchQrCode, {
          Bearer: sessionToken,
          body: {
            aarQrCodeValue: aQRCode
          },
          isTest: isSendUATEnvironment
        })
        .throw(new Error())
        .put(setAarFlowState(getMockKoState(mockFetchingQrState)))
        .next()
        .isDone();
    })
  );
});

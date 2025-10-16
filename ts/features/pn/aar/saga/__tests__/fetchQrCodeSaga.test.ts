import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { isPnTestEnabledSelector } from "../../../../../store/reducers/persistedPreferences";
import { SessionToken } from "../../../../../types/SessionToken";
import { SendAARClient } from "../../api/client";
import { setAarFlowState } from "../../store/actions";
import { currentAARFlowData } from "../../store/selectors";
import { AARFlowState, sendAARFlowStates } from "../../utils/stateUtils";
import { fetchAARQrCodeSaga } from "../fetchQrCodeSaga";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { AARProblemJson } from "../../../../../../definitions/pn/aar/AARProblemJson";
import { trackSendAARFailure } from "../../analytics";

const sendUATEnvironment = [false, true];

describe("fetchQrCodeSaga", () => {
  const aQRCode = "TESTTEST";
  const sessionToken = "test-session-token" as SessionToken;
  const sessionTokenWithBearer = `Bearer ${sessionToken}` as SessionToken;
  const getMockKoState = (
    prevState: AARFlowState,
    error: AARProblemJson | undefined,
    reason: string
  ): AARFlowState => ({
    type: "ko",
    previousState: { ...prevState },
    ...(error != null && { error }),
    debugData: {
      phase:
        prevState.type === "fetchingQRData"
          ? "Fetch QRCode"
          : prevState.type === "fetchingNotificationData"
          ? "Fetch Notification"
          : "Entry Point",
      reason
    }
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

  sendUATEnvironment.forEach(isSendUATEnvironment => {
    [undefined, "d27a353f-09a9-46c0-a63f-ab7a72cb1861"].forEach(mandateId => {
      it(`should correctly update state on a 200 response with isTest='${isSendUATEnvironment}' and mandateId='${mandateId}'`, () => {
        const successState: AARFlowState = {
          type: sendAARFlowStates.fetchingNotificationData,
          iun: "123123",
          fullNameDestinatario: "nomecognome",
          mandateId
        };
        const successResponse = E.right({
          headers: {},
          status: 200,
          value: {
            iun: "123123",
            recipientInfo: {
              denomination: "nomecognome",
              taxId: "taxID"
            },
            mandateId
          }
        });
        const mockApiCall = jest
          .fn()
          .mockReturnValue(mockResolvedCall(successResponse));

        testSaga(fetchAARQrCodeSaga, mockApiCall, sessionToken)
          .next()
          .select(currentAARFlowData)
          .next(mockFetchingQrState)
          .select(isPnTestEnabledSelector)
          .next(isSendUATEnvironment)
          .call(withRefreshApiCall, mockApiCall())
          .next(successResponse)
          .put(setAarFlowState(successState))
          .next()
          .isDone();

        expect(mockApiCall).toHaveBeenCalledWith({
          Bearer: sessionTokenWithBearer,
          body: {
            aarQrCodeValue: aQRCode
          },
          isTest: isSendUATEnvironment
        });
      });
    });

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

      const mockApiCall = jest
        .fn()
        .mockReturnValue(mockResolvedCall(notAddresseeResponse));

      testSaga(fetchAARQrCodeSaga, mockApiCall, sessionToken)
        .next()
        .select(currentAARFlowData)
        .next(mockFetchingQrState)
        .select(isPnTestEnabledSelector)
        .next(isSendUATEnvironment)
        .call(withRefreshApiCall, mockApiCall())
        .next(notAddresseeResponse)
        .put(setAarFlowState(notAddresseeState))
        .next()
        .isDone();

      expect(mockApiCall).toHaveBeenCalledWith({
        Bearer: sessionTokenWithBearer,
        body: {
          aarQrCodeValue: aQRCode
        },
        isTest: isSendUATEnvironment
      });
    });
    [
      (E.left(undefined),
      E.right({
        status: 500,
        value: { status: 500, detail: "A detail" } as AARProblemJson
      }),
      E.right({
        status: 418,
        value: { status: 418, detail: "A detail" } as AARProblemJson
      }))
    ].forEach(res =>
      it(`should dispatch KO state on a response of ${JSON.stringify(
        res
      )} with isTest='${isSendUATEnvironment}'`, () => {
        // eslint-disable-next-line no-underscore-dangle
        const error = res._tag === "Right" ? res.right.value : undefined;
        const reason = `HTTP request failed (${
          // eslint-disable-next-line no-underscore-dangle
          res._tag === "Right" ? res.right.status : ""
        } ${
          // eslint-disable-next-line no-underscore-dangle
          res._tag === "Right" ? res.right.value.status : ""
        } A detail)`;
        testSaga(fetchAARQrCodeSaga, mockFetchQrCode, sessionToken)
          .next()
          .select(currentAARFlowData)
          .next(mockFetchingQrState)
          .select(isPnTestEnabledSelector)
          .next(isSendUATEnvironment)
          .call(withRefreshApiCall, mockFetchQrCode())
          .next(res)
          .call(trackSendAARFailure, "Fetch QRCode", reason)
          .next()
          .put(
            setAarFlowState(getMockKoState(mockFetchingQrState, error, reason))
          )
          .next()
          .isDone();

        expect(mockFetchQrCode).toHaveBeenCalledWith({
          Bearer: sessionTokenWithBearer,
          body: {
            aarQrCodeValue: aQRCode
          },
          isTest: isSendUATEnvironment
        });
      })
    );
  });

  it("should exit early if the current state is wrong", () => {
    testSaga(fetchAARQrCodeSaga, mockFetchQrCode, sessionToken)
      .next()
      .select(currentAARFlowData)
      .next(mockTosState)
      .call(
        trackSendAARFailure,
        "Fetch QRCode",
        "Called in wrong state (displayingAARToS)"
      )
      .next()
      .isDone();
  });
  it("should dispatch KO state on exception throw", () => {
    testSaga(fetchAARQrCodeSaga, mockFetchQrCode, sessionToken)
      .next()
      .select(currentAARFlowData)
      .next(mockFetchingQrState)
      .select(isPnTestEnabledSelector)
      .next(true)
      .call(withRefreshApiCall, mockFetchQrCode())
      .throw(new Error())
      .call(trackSendAARFailure, "Fetch QRCode", "An error was thrown ()")
      .next()
      .put(
        setAarFlowState(
          getMockKoState(
            mockFetchingQrState,
            undefined,
            `An error was thrown ()`
          )
        )
      )
      .next()
      .isDone();
    expect(mockFetchQrCode).toHaveBeenCalledWith({
      Bearer: sessionTokenWithBearer,
      body: {
        aarQrCodeValue: aQRCode
      },
      isTest: true
    });
  });
  it("should dispatch KO state on a decoding failute", () => {
    const failureDecodingResponse = E.left([]);
    const mockApiCall = jest
      .fn()
      .mockReturnValue(mockResolvedCall(failureDecodingResponse));
    testSaga(fetchAARQrCodeSaga, mockApiCall, sessionToken)
      .next()
      .select(currentAARFlowData)
      .next(mockFetchingQrState)
      .select(isPnTestEnabledSelector)
      .next(true)
      .call(withRefreshApiCall, mockApiCall())
      .next(failureDecodingResponse)
      .call(trackSendAARFailure, "Fetch QRCode", "Decoding failure ()")
      .next()
      .put(
        setAarFlowState(
          getMockKoState(mockFetchingQrState, undefined, `Decoding failure ()`)
        )
      )
      .next()
      .isDone();
  });
});

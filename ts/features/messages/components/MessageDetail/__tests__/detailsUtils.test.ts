import * as pot from "@pagopa/ts-commons/lib/pot";
import { PaymentInfoResponse } from "../../../../../../definitions/backend/PaymentInfoResponse";
import { Detail_v2Enum } from "../../../../../../definitions/backend/PaymentProblemJson";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import {
  isError,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../../../../common/model/RemoteValue";
import { GlobalState } from "../../../../../store/reducers/types";
import { CTA } from "../../../../../types/LocalizedCTAs";
import * as analytics from "../../../analytics";
import {
  toGenericMessagePaymentError,
  toSpecificMessagePaymentError,
  toTimeoutMessagePaymentError,
  MessagePaymentError
} from "../../../types/paymentErrors";
import {
  computeAndTrackCTAPressAnalytics,
  computeAndTrackPaymentStart,
  shouldUpdatePaymentUponReturning
} from "../detailsUtils";

describe("detailsUtils", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe("computeAndTrackCTAPressAnalytics", () => {
    [false, true].forEach(isFirstCDN =>
      it(`should call 'trackCTAPressed' with proper parameters (isFirstCDN ${isFirstCDN})`, () => {
        const serviceId = "01JWV43EWTSHDSGYTXADEXXQEX" as ServiceId;
        const service = {
          name: "Test service",
          organization: {
            name: "Test organization",
            fiscal_code: "12345678901"
          }
        };
        const ctaText = "Test CTA";
        const spiedOnMockedTrackCTAPressed = jest
          .spyOn(analytics, "trackCTAPressed")
          .mockImplementation();
        computeAndTrackCTAPressAnalytics(
          isFirstCDN,
          { text: ctaText } as CTA,
          serviceId,
          {
            features: {
              services: {
                details: {
                  dataById: {
                    [serviceId]: pot.some(service)
                  }
                }
              }
            }
          } as GlobalState
        );
        expect(spiedOnMockedTrackCTAPressed.mock.calls.length).toBe(1);
        expect(spiedOnMockedTrackCTAPressed.mock.calls[0].length).toBe(6);
        expect(spiedOnMockedTrackCTAPressed.mock.calls[0][0]).toBe(serviceId);
        expect(spiedOnMockedTrackCTAPressed.mock.calls[0][1]).toBe(
          service.name
        );
        expect(spiedOnMockedTrackCTAPressed.mock.calls[0][2]).toBe(
          service.organization.name
        );
        expect(spiedOnMockedTrackCTAPressed.mock.calls[0][3]).toBe(
          service.organization.fiscal_code
        );
        expect(spiedOnMockedTrackCTAPressed.mock.calls[0][4]).toBe(isFirstCDN);
        expect(spiedOnMockedTrackCTAPressed.mock.calls[0][5]).toBe(ctaText);
      })
    );
  });
  describe("computeAndTrackPaymentStart", () => {
    it(`should call 'trackPaymentStart' with proper parameters`, () => {
      const serviceId = "01JWV43EWTSHDSGYTXADEXXQEX" as ServiceId;
      const service = {
        name: "Test service",
        organization: {
          name: "Test organization",
          fiscal_code: "12345678901"
        }
      };
      const spiedOnMockedTrackPaymentStart = jest
        .spyOn(analytics, "trackPaymentStart")
        .mockImplementation();
      computeAndTrackPaymentStart(serviceId, {
        features: {
          services: {
            details: {
              dataById: {
                [serviceId]: pot.some(service)
              }
            }
          }
        }
      } as GlobalState);
      expect(spiedOnMockedTrackPaymentStart.mock.calls.length).toBe(1);
      expect(spiedOnMockedTrackPaymentStart.mock.calls[0].length).toBe(4);
      expect(spiedOnMockedTrackPaymentStart.mock.calls[0][0]).toBe(serviceId);
      expect(spiedOnMockedTrackPaymentStart.mock.calls[0][1]).toBe(
        service.name
      );
      expect(spiedOnMockedTrackPaymentStart.mock.calls[0][2]).toBe(
        service.organization.name
      );
      expect(spiedOnMockedTrackPaymentStart.mock.calls[0][3]).toBe(
        service.organization.fiscal_code
      );
    });
  });
  describe("shouldUpdatePaymentUponReturning", () => {
    (
      [
        [remoteUndefined, false],
        [remoteLoading, false],
        [
          remoteReady<PaymentInfoResponse>({
            amount: 100
          } as PaymentInfoResponse),
          true
        ],
        [
          remoteError<MessagePaymentError>(
            toGenericMessagePaymentError("An error occurred")
          ),
          true
        ],
        [
          remoteError<MessagePaymentError>(toTimeoutMessagePaymentError()),
          true
        ],
        [
          remoteError<MessagePaymentError>(
            toSpecificMessagePaymentError(Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO)
          ),
          false
        ]
      ] as const
    ).forEach(([payment, expected]) =>
      it(`should return ${expected} for ${payment.kind} ${
        isError(payment) ? payment.error.type : ""
      }`, () => {
        const output = shouldUpdatePaymentUponReturning(payment);
        expect(output).toBe(expected);
      })
    );
  });
});

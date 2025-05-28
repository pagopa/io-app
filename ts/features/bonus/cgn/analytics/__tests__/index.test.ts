import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import trackCgnAction from "..";
import * as MIXPANEL from "../../../../../mixpanel";
import {
  cgnActivationBack,
  cgnActivationCancel,
  cgnActivationComplete,
  cgnActivationFailure,
  cgnActivationStart,
  cgnActivationStatus,
  cgnRequestActivation
} from "../../store/actions/activation";
import { cgnDetails } from "../../store/actions/details";
import {
  cgnEycaActivation,
  cgnEycaActivationCancel,
  cgnEycaActivationStatusRequest
} from "../../store/actions/eyca/activation";
import { cgnEycaStatus } from "../../store/actions/eyca/details";
import { cgnGenerateOtp } from "../../store/actions/otp";
import {
  cgnOfflineMerchants,
  cgnOnlineMerchants,
  cgnSelectedMerchant
} from "../../store/actions/merchants";
import { cgnCodeFromBucket } from "../../store/actions/bucket";
import { cgnUnsubscribe } from "../../store/actions/unsubscribe";
import { cgnCategories } from "../../store/actions/categories";
import { CgnActivationProgressEnum } from "../../store/reducers/activation";
import { StatusEnum } from "../../../../../../definitions/cgn/CardPending";
import { OtpCode } from "../../../../../../definitions/cgn/OtpCode";

describe("index", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  describe("trackCgnAction", () => {
    (
      [
        // Activation actions
        [cgnActivationStart(), 1],
        [cgnRequestActivation(), 1],
        [cgnActivationComplete(), 1],
        [cgnActivationCancel(), 1],
        [cgnActivationBack(), 1],
        [cgnActivationFailure("Error message"), 2, { reason: "Error message" }],
        [
          cgnActivationStatus.success({
            status: CgnActivationProgressEnum.SUCCESS
          }),
          2,
          { status: CgnActivationProgressEnum.SUCCESS }
        ],
        [cgnActivationStatus.failure(Error("")), 2, { reason: "" }],

        // Details actions
        [cgnDetails.request(), 1],
        [cgnDetails.success({ status: StatusEnum.PENDING }), 1],
        [cgnDetails.failure({ kind: "timeout" }), 2, { reason: "timeout" }],

        // EYCA actions
        [cgnEycaActivation.request(), 1],
        [cgnEycaActivation.success("COMPLETED"), 2, { status: "COMPLETED" }],
        [
          cgnEycaActivation.failure({ kind: "timeout" }),
          2,
          { reason: "timeout" }
        ],
        [cgnEycaActivationStatusRequest(), 1],
        [cgnEycaActivationCancel(), 1],
        [cgnEycaStatus.request(), 1],
        [
          cgnEycaStatus.success({ status: "INELIGIBLE" }),
          2,
          { status: "INELIGIBLE" }
        ],
        [cgnEycaStatus.failure({ kind: "timeout" }), 2, { reason: "timeout" }],

        // Merchants actions
        [cgnOfflineMerchants.request({}), 1],
        [cgnOfflineMerchants.success([]), 2, { foundMerchants: 0 }],
        [
          cgnOfflineMerchants.failure({ kind: "timeout" }),
          2,
          { reason: "timeout" }
        ],
        [cgnOnlineMerchants.request({}), 1],
        [cgnOnlineMerchants.success([]), 2, { foundMerchants: 0 }],
        [
          cgnOnlineMerchants.failure({ kind: "timeout" }),
          2,
          { reason: "timeout" }
        ],
        [cgnSelectedMerchant.request("merchant1" as NonEmptyString), 1],
        [
          cgnSelectedMerchant.success({
            id: "merchant1" as NonEmptyString,
            name: "Merchant 1" as NonEmptyString,
            discounts: [],
            allNationalAddresses: false
          }),
          1
        ],
        [
          cgnSelectedMerchant.failure({ kind: "timeout" }),
          2,
          { reason: "timeout" }
        ],

        // OTP actions
        [
          cgnGenerateOtp.request({
            onSuccess: () => null,
            onError: () => null
          }),
          1
        ],
        [
          cgnGenerateOtp.success({
            code: "123456" as OtpCode,
            expires_at: new Date(),
            ttl: 5
          }),
          1
        ],
        [cgnGenerateOtp.failure({ kind: "timeout" }), 2, { reason: "timeout" }],

        // Bucket actions
        [
          cgnCodeFromBucket.request({
            discountId: "asd" as NonEmptyString,
            onSuccess: () => null,
            onError: () => null
          }),
          1
        ],
        [
          cgnCodeFromBucket.success({ kind: "success", value: { code: "" } }),
          2,
          { status: "success" }
        ],
        [
          cgnCodeFromBucket.failure({ kind: "timeout" }),
          2,
          { reason: "timeout" }
        ],

        // Categories actions
        [cgnCategories.request(), 1],
        [cgnCategories.success([]), 1],
        [cgnCategories.failure({ kind: "timeout" }), 2, { reason: "timeout" }],

        // Unsubscribe actions
        [cgnUnsubscribe.request(), 1],
        [cgnUnsubscribe.success(), 1],
        [cgnUnsubscribe.failure({ kind: "timeout" }), 2, { reason: "timeout" }]
      ] as const
    ).forEach(inputTriple => {
      const action = inputTriple[0];
      it(`should call 'mixpanelTrack' with proper event name and properties for action of type '${action.type}'`, () => {
        const spiedMockedMixpanelTrack = jest
          .spyOn(MIXPANEL, "mixpanelTrack")
          .mockImplementation((_event, _props) => undefined);

        trackCgnAction(action);

        expect(spiedMockedMixpanelTrack.mock.calls.length).toBe(1);
        const expectedParameters = inputTriple[1];
        expect(spiedMockedMixpanelTrack.mock.calls[0].length).toBe(
          expectedParameters
        );
        expect(spiedMockedMixpanelTrack.mock.calls[0][0]).toBe(action.type);
        if (expectedParameters === 2) {
          expect(spiedMockedMixpanelTrack.mock.calls[0][1]).toEqual(
            inputTriple[2]
          );
        }
      });
    });

    it("should not call mixpanelTrack for unhandled actions", () => {
      const spiedMockedMixpanelTrack = jest
        .spyOn(MIXPANEL, "mixpanelTrack")
        .mockImplementation((_event, _props) => undefined);
      const unhandledAction = {
        type: "UNHANDLED_ACTION_TYPE",
        payload: {}
      };

      trackCgnAction(unhandledAction as any);

      expect(spiedMockedMixpanelTrack.mock.calls.length).toBe(0);
    });
  });
});

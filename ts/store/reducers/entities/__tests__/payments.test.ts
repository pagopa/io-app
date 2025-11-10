import { Detail_v2Enum } from "../../../../../definitions/backend/PaymentProblemJson";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import {
  updatePaymentForMessage,
  UpdatePaymentForMessageFailure
} from "../../../../features/messages/store/actions";
import { toSpecificError } from "../../../../features/messages/types/paymentErrors";
import { isPaidPaymentFromDetailV2Enum } from "../../../../utils/payment";
import { paymentByRptIdReducer, PaymentByRptIdState } from "../payments";

describe("payments", () => {
  describe("paymentByRptIdReducer", () => {
    const rptId1 = "01234567890012345678912345610";
    const rptId2 = "01234567890012345678912345620";
    const initialState: PaymentByRptIdState = {
      [rptId1]: {
        kind: "COMPLETED",
        transactionId: 15
      },
      [rptId2]: {
        kind: "DUPLICATED"
      }
    };
    const payload: UpdatePaymentForMessageFailure = {
      reason: toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO),
      messageId: "5a15aba4-7cd6-490b-b3fe-cf766f731a2f",
      paymentId: "01234567890012345678912345630",
      serviceId: "75c046cf-77a7-4d33-9c3f-578e00379b55" as ServiceId
    };

    Object.values(Detail_v2Enum)
      .filter(detailV2Enum => !isPaidPaymentFromDetailV2Enum(detailV2Enum))
      .forEach(detailV2Enum => {
        it(`should return the input state if the failure details are '${detailV2Enum}'`, () => {
          const outputState = paymentByRptIdReducer(
            initialState,
            updatePaymentForMessage.failure({
              ...payload,
              reason: toSpecificError(detailV2Enum)
            })
          );
          expect(outputState).toBe(initialState);
        });
      });
    it(`should return the input state if failure details are 'PAA_PAGAMENTO_DUPLICATO' but there is already a record in the state for the input payment`, () => {
      const outputState = paymentByRptIdReducer(
        initialState,
        updatePaymentForMessage.failure({
          ...payload,
          paymentId: rptId1,
          reason: toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO)
        })
      );
      expect(outputState).toBe(initialState);
    });
    it(`should return the input state if failure details are 'PPT_PAGAMENTO_DUPLICATO' but there is already a record in the state for the input payment`, () => {
      const outputState = paymentByRptIdReducer(
        initialState,
        updatePaymentForMessage.failure({
          ...payload,
          paymentId: rptId1,
          reason: toSpecificError(Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO)
        })
      );
      expect(outputState).toBe(initialState);
    });
    it(`should return the updated state if failure details are 'PAA_PAGAMENTO_DUPLICATO' and there is no record for the input payment`, () => {
      const outputState = paymentByRptIdReducer(
        initialState,
        updatePaymentForMessage.failure({
          ...payload,
          reason: toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO)
        })
      );
      expect(outputState).toEqual({
        ...initialState,
        [payload.paymentId]: { kind: "DUPLICATED" }
      });
    });
    it(`should return the updated state if failure details are 'PPT_PAGAMENTO_DUPLICATO' and there is no record for the input payment`, () => {
      const outputState = paymentByRptIdReducer(
        initialState,
        updatePaymentForMessage.failure({
          ...payload,
          reason: toSpecificError(Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO)
        })
      );
      expect(outputState).toEqual({
        ...initialState,
        [payload.paymentId]: { kind: "DUPLICATED" }
      });
    });
  });
});

import * as AR from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";

import {
  paymentCompletedSuccess,
  paymentIdPolling,
  paymentVerifica
} from "../../../actions/wallet/payment";
import { fetchTransactionSuccess } from "../../../actions/wallet/transactions";
import reducer, { PaymentsHistoryState, HISTORY_SIZE } from "../history";
import { isPaymentDoneSuccessfully } from "../utils";
import { paymentOutcomeCode } from "../../../actions/wallet/outcomeCode";
import {
  paymentVerificaResponseWithMessage,
  paymentVerificaRequestWithMessage,
  validTransaction
} from "../../../../__mocks__/paymentPayloads";
import { myRptId } from "../../../../utils/testFaker";

const initialState: PaymentsHistoryState = [];

const paymentVerificaRequest = paymentVerifica.request(
  paymentVerificaRequestWithMessage
);

const paymentVerificaSuccess = paymentVerifica.success(
  paymentVerificaResponseWithMessage
);

describe("history reducer", () => {
  describe("when a `paymentVerifica.request` is sent", () => {
    it("should add a payment to the history", () => {
      const state = reducer(initialState, paymentVerificaRequest);
      expect(state.length).toEqual(1);
      expect(state[0].data).toEqual(paymentVerificaRequestWithMessage.rptId);
      expect(state[0].startOrigin).toEqual(
        paymentVerificaRequestWithMessage.startOrigin
      );
    });

    it("should add a payment that is not yet ended", () => {
      const state = reducer(initialState, paymentVerificaRequest);
      expect(isPaymentDoneSuccessfully(state[0])).toEqual(O.none);
    });
  });

  describe("when two `paymentVerifica.request` are sent", () => {
    describe("and they are identical", () => {
      it("should add only one payment to the history", () => {
        // eslint-disable-next-line functional/no-let
        let state = reducer(initialState, paymentVerificaRequest);
        state = reducer(state, paymentVerificaRequest);
        expect(state.length).toEqual(1);
      });
    });

    describe("and they carry the same notice number but from different organizations", () => {
      it("should persist both the payments", () => {
        // eslint-disable-next-line functional/no-let
        let state = reducer(initialState, paymentVerificaRequest);
        state = reducer(
          state,
          paymentVerifica.request({
            ...paymentVerificaRequestWithMessage,
            rptId: {
              ...paymentVerificaRequestWithMessage.rptId,
              organizationFiscalCode: "00000000001" as OrganizationFiscalCode
            }
          })
        );
        expect(state.length).toEqual(2);
      });
    });
  });

  describe("when a `paymentVerifica.success` is sent", () => {
    it("should update the existing payment history", () => {
      // eslint-disable-next-line functional/no-let
      let state = reducer([...initialState], paymentVerificaRequest);
      state = reducer(state, paymentVerificaSuccess);
      expect(state.length).toEqual(1);
      expect(state[0].verifiedData).toEqual(paymentVerificaResponseWithMessage);
    });
  });

  describe("when a `paymentVerifica.failure` is sent", () => {
    it("should update the existing payment history", () => {
      // eslint-disable-next-line functional/no-let
      let state = reducer(initialState, paymentVerificaRequest);
      state = reducer(state, paymentVerifica.failure("PPT_IMPORTO_ERRATO"));
      expect(state.length).toEqual(1);
      expect(state[0].failure).toEqual("PPT_IMPORTO_ERRATO");
    });
  });

  describe("when a `paymentOutcomeCode` is sent", () => {
    it("should update the first existing payment with the same code", () => {
      const randomCode = Math.random().toString();
      // eslint-disable-next-line functional/no-let
      let state = reducer(initialState, paymentVerificaRequest);
      state = reducer(state, paymentVerificaSuccess);
      state = reducer(
        state,
        paymentOutcomeCode({
          outcome: O.some(randomCode),
          paymentMethodType: "CreditCard"
        })
      );
      expect(state.length).toEqual(1);
      expect(state[0].outcomeCode).toEqual(randomCode);
    });
  });

  describe("when a `paymentCompletedSuccess` is sent", () => {
    it("should update the existing payment in history", () => {
      // eslint-disable-next-line functional/no-let
      let state = reducer(initialState, paymentVerificaRequest);
      state = reducer(
        state,
        paymentCompletedSuccess({
          rptId: myRptId,
          kind: "COMPLETED",
          transaction: undefined
        })
      );
      expect(state.length).toEqual(1);
      expect(state[0].success).toBe(true);
    });
  });

  describe("when a `paymentIdPolling` is sent", () => {
    it("should update the existing payment with the payment id", () => {
      const paymentId = "123456ABCD";
      // eslint-disable-next-line functional/no-let
      let state = reducer(initialState, paymentVerificaRequest);
      state = reducer(state, paymentIdPolling.success(paymentId));
      expect(state.length).toEqual(1);
      expect(state[0].paymentId).toEqual(paymentId);
    });
  });

  describe("when a `fetchTransactionSuccess` is sent", () => {
    it("should update the existing payment history with the transaction", () => {
      // eslint-disable-next-line functional/no-let
      let state = reducer(initialState, paymentVerificaRequest);
      state = reducer(state, fetchTransactionSuccess(validTransaction));
      expect(state.length).toEqual(1);
      expect(state[0].transaction).toEqual(validTransaction);
    });
  });

  it(`should limit the payment history insertions to ${HISTORY_SIZE}`, () => {
    // eslint-disable-next-line functional/no-let
    let state = initialState;
    AR.range(1, HISTORY_SIZE + 1).forEach((_, i) => {
      state = reducer(
        state,
        paymentVerifica.request({
          ...paymentVerificaRequestWithMessage,
          rptId: {
            ...paymentVerificaRequestWithMessage.rptId,
            paymentNoticeNumber: {
              ...paymentVerificaRequestWithMessage.rptId.paymentNoticeNumber,
              auxDigit: i.toString() as any
            }
          },
          startOrigin: "message"
        })
      );
    });
    expect(state.length).toEqual(HISTORY_SIZE);
  });
});

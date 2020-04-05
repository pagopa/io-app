import { range } from "fp-ts/lib/Array";
import { RptId } from "italia-pagopa-commons/lib/pagopa";
import { OrganizationFiscalCode } from "italia-ts-commons/lib/strings";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { paymentVerifica } from "../../actions/wallet/payment";
import reducer, {
  HISTORY_SIZE,
  PaymentsHistoryState
} from "../payments/history";
// tslint:disable-next-line: no-let
let state: PaymentsHistoryState = [];

describe("payments history", () => {
  const anRptId = RptId.decode({
    organizationFiscalCode: "00000000000",
    paymentNoticeNumber: {
      applicationCode: "02",
      auxDigit: "0",
      checkDigit: "78",
      iuv13: "1600000000000"
    }
  }).value as RptId;

  const successData = PaymentRequestsGetResponse.decode({
    importoSingoloVersamento: 1,
    codiceContestoPagamento: "54ea05a0773011ea9dc75dfcb08809dc",
    ibanAccredito: "IT93I050345728000000000000",
    causaleVersamento: "CAUSALE",
    enteBeneficiario: {
      identificativoUnivocoBeneficiario: "0000000000",
      denominazioneBeneficiario: "Comune Fake",
      indirizzoBeneficiario: "Piazza Fake",
      capBeneficiario: "00000",
      localitaBeneficiario: "Fake",
      provinciaBeneficiario: "XX",
      nazioneBeneficiario: "IT"
    }
  }).value as PaymentRequestsGetResponse;

  it("should add a payment in the history", () => {
    state = reducer(state, paymentVerifica.request(anRptId));
    expect(state.length).toEqual(1);
  });

  it("should not add a payment in the history because it is the same", () => {
    state = reducer(state, paymentVerifica.request(anRptId));
    expect(state.length).toEqual(1);
  });

  it("should update the existing payment history with success values", () => {
    state = reducer(state, paymentVerifica.success(successData));
    expect(state.length).toEqual(1);
    expect(state[0].verified_data).toEqual(successData);
  });

  it("should add a payment in the history", () => {
    // change some attrs to make a new payment
    state = reducer(
      state,
      paymentVerifica.request({
        ...anRptId,
        organizationFiscalCode: "123098" as OrganizationFiscalCode
      })
    );
    expect(state.length).toEqual(2);
    expect(state[1].verified_data).toEqual(undefined);
  });

  it("should limit the payment history insertions", () => {
    // change some attrs to make a new payment
    range(1, HISTORY_SIZE + 10).forEach(_ => {
      state = reducer(
        state,
        paymentVerifica.request({
          ...anRptId,
          organizationFiscalCode: `123098${_}` as OrganizationFiscalCode
        })
      );
    });
    expect(state.length).toBeLessThanOrEqual(HISTORY_SIZE);
  });
});

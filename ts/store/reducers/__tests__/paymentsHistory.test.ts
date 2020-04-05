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
    organizationFiscalCode: "00000123456",
    paymentNoticeNumber: {
      applicationCode: "02",
      auxDigit: "0",
      checkDigit: "78",
      iuv13: "1600203993985"
    }
  }).value as RptId;

  const successData = PaymentRequestsGetResponse.decode({
    importoSingoloVersamento: 1,
    codiceContestoPagamento: "54ea05a0773011ea9dc75dfcb08809dc",
    ibanAccredito: "IT93I0503457280000000117101",
    causaleVersamento: "99 TEST_PAGOPASPA_IO VAIANO CREMASCO",
    enteBeneficiario: {
      identificativoUnivocoBeneficiario: "00122230196",
      denominazioneBeneficiario: "Comune di Vaiano Cremasco",
      indirizzoBeneficiario: "Piazza Gloriosi Caduti, 2",
      capBeneficiario: "26010",
      localitaBeneficiario: "Vaiano Cremasco",
      provinciaBeneficiario: "CR",
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

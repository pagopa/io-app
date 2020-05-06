import { range } from "fp-ts/lib/Array";
import { none, some } from "fp-ts/lib/Option";
import { RptId } from "italia-pagopa-commons/lib/pagopa";
import { OrganizationFiscalCode } from "italia-ts-commons/lib/strings";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { Transaction } from "../../../types/pagopa";
import {
  paymentIdPolling,
  paymentVerifica
} from "../../actions/wallet/payment";
import { fetchTransactionSuccess } from "../../actions/wallet/transactions";
import reducer, {
  HISTORY_SIZE,
  isPaymentDoneSuccessfully,
  PaymentsHistoryState
} from "../payments/history";
// tslint:disable-next-line: no-let
let state: PaymentsHistoryState = [];

describe("payments history", () => {
  // tslint:disable-next-line:no-useless-cast
  const anRptId = RptId.decode({
    organizationFiscalCode: "00000000000",
    paymentNoticeNumber: {
      applicationCode: "02",
      auxDigit: "0",
      checkDigit: "78",
      iuv13: "1600000000000"
    }
  }).value as RptId;

  // tslint:disable-next-line:no-useless-cast
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

  it("should not recognize a payment as failed or successfully", () => {
    expect(isPaymentDoneSuccessfully(state[0])).toEqual(none);
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

  it("should not recognize a payment as failed or successfully", () => {
    expect(isPaymentDoneSuccessfully(state[0])).toEqual(none);
  });

  it("should update the existing payment history with the payment id", () => {
    const paymentId = "123456ABCD";
    state = reducer(state, paymentIdPolling.success(paymentId));
    expect(state.length).toEqual(1);
    expect(state[0].paymentId).toEqual(paymentId);
  });

  it("should update the existing payment history with the transaction", () => {
    const validAmount: { [key: string]: any } = {
      currency: "EUR",
      amount: 1000,
      decimalDigits: 2
    };
    const validPsp: { [key: string]: any } = {
      id: 43188,
      idPsp: "idPsp1",
      businessName: "WHITE bank",
      paymentType: "CP",
      idIntermediary: "idIntermediario1",
      idChannel: "idCanale14",
      logoPSP:
        "https://acardste.vaservices.eu:1443/pp-restapi/v1/resources/psp/43188",
      serviceLogo:
        "https://acardste.vaservices.eu:1443/pp-restapi/v1/resources/service/43188",
      serviceName: "nomeServizio 10 white",
      fixedCost: validAmount,
      appChannel: false,
      tags: ["MAESTRO"],
      serviceDescription: "DESCRIZIONE servizio: CP mod1",
      serviceAvailability: "DISPONIBILITA servizio 24/7",
      paymentModel: 1,
      flagStamp: true,
      idCard: 91,
      lingua: "IT"
    };
    const validTransaction: { [key: string]: any } = {
      id: 2329,
      created: "2018-08-08T20:16:41Z",
      updated: "2018-08-08T20:16:41Z",
      amount: validAmount,
      grandTotal: validAmount,
      description: "pagamento fotocopie pratica",
      merchant: "Comune di Torino",
      idStatus: 3,
      statusMessage: "Confermato",
      error: false,
      success: true,
      fee: validAmount,
      token: "MjMyOQ==",
      idWallet: 2345,
      idPsp: validPsp.id,
      idPayment: 4464,
      accountingStatus: 1,
      nodoIdPayment: "eced7084-6c8e-4f03-b3ed-d556692ce090"
    };
    state = reducer(
      state,
      fetchTransactionSuccess(validTransaction as Transaction)
    );
    expect(state.length).toEqual(1);
    expect(state[0].transaction).toEqual(validTransaction);
  });

  it("should recognize a sucessfully payment", () => {
    expect(isPaymentDoneSuccessfully(state[0])).toEqual(some(true));
  });

  it("should update the existing payment history with failure value", () => {
    state = reducer(state, paymentVerifica.failure("INVALID_AMOUNT"));
    expect(state.length).toEqual(1);
    expect(state[0].failure).toEqual("INVALID_AMOUNT");
  });

  it("should recognize a failed payment", () => {
    expect(isPaymentDoneSuccessfully(state[0])).toEqual(some(false));
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

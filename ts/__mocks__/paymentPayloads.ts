import {
  IPatternStringTag,
  IWithinRangeStringTag
} from "@pagopa/ts-commons/lib/strings";

import { paymentVerifica } from "../store/actions/wallet/payment";
import { ImportoEuroCents } from "../../definitions/backend/ImportoEuroCents";
import { myRptId } from "../utils/testFaker";
import { Amount, Transaction } from "../types/pagopa";

export const messageId = "abcde-12345";

export const paymentVerificaRequestWithMessage: Parameters<
  typeof paymentVerifica.request
>[0] = {
  rptId: myRptId,
  startOrigin: "message"
};

export const paymentVerificaResponseWithMessage: Parameters<
  typeof paymentVerifica.success
>[0] = {
  importoSingoloVersamento: 1 as ImportoEuroCents,
  codiceContestoPagamento: "03314e90321011eaa22f931313a0ec7c" as string &
    IWithinRangeStringTag<32, 33>,
  ibanAccredito: "IT00V0000000000000000000000" as
    | (string & IPatternStringTag<"[a-zA-Z]{2}[0-9]{2}[a-zA-Z0-9]{1,30}">)
    | undefined,
  causaleVersamento: "Avviso di prova app IO",
  enteBeneficiario: {
    identificativoUnivocoBeneficiario: "01199250158",
    denominazioneBeneficiario: "Comune di Milano"
  },
  spezzoniCausaleVersamento: [
    {
      spezzoneCausaleVersamento: "causale versamento di prova"
    }
  ]
};

export const validAmount: Amount = {
  currency: "EUR",
  amount: 1000,
  decimalDigits: 2
};

export const validPsp: { [key: string]: any } = {
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

export const validTransaction: Transaction = {
  id: 2329,
  created: new Date("2018-08-08T20:16:41Z"),
  updated: new Date("2018-08-08T20:16:41Z"),
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

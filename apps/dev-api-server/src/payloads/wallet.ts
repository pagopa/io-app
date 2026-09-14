import { fakerIT as faker } from "@faker-js/faker";
import { PspDataListResponse } from "@io-app/api-types/generated/definitions/pagopa/PspDataListResponse";
import { Transaction } from "@io-app/api-types/generated/definitions/pagopa/Transaction";
import { CreditCard } from "@io-app/api-types/generated/definitions/pagopa/walletv2/CreditCard";
import {
  LinguaEnum,
  Psp
} from "@io-app/api-types/generated/definitions/pagopa/walletv2/Psp";
import { SessionResponse } from "@io-app/api-types/generated/definitions/pagopa/walletv2/SessionResponse";
import {
  TypeEnum,
  Wallet
} from "@io-app/api-types/generated/definitions/pagopa/walletv2/Wallet";
import { WalletListResponse } from "@io-app/api-types/generated/definitions/pagopa/walletv2/WalletListResponse";
import { pipe } from "fp-ts/lib/function";
import { range } from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";

import { assetsFolder } from "../config";
import { readFileAsJSON } from "../utils/file";
import { creditCardBrands, getCreditCardLogo } from "../utils/payment";
import { getRandomValue } from "../utils/random";
import { validatePayload } from "../utils/validator";

export const sessionToken: SessionResponse = {
  data: {
    sessionToken: faker.string.alphanumeric(128)
  }
};

const serviceDescription = "DESCRIZIONE servizio: CP mod1";
const serviceAvailability = "DISPONIBILITA servizio 24/7";

export const validPsp: Psp = {
  id: 40000,
  idPsp: "idPsp1",
  businessName: "WHITE bank",
  paymentType: "CP",
  idIntermediary: "idIntermediario1",
  idChannel: "idCanale14",
  logoPSP:
    "https://icons.iconarchive.com/icons/graphicloads/100-flat/256/bank-icon.png",
  serviceLogo:
    "https://icons.iconarchive.com/icons/graphicloads/100-flat/256/bank-icon.png",
  serviceName: "nomeServizio 10 white",
  fixedCost: {
    currency: "EUR",
    amount: 100,
    decimalDigits: 2
  },
  appChannel: false,
  tags: ["MAESTRO", "VISA"],
  serviceDescription,
  serviceAvailability,
  paymentModel: 1,
  flagStamp: true,
  idCard: 91,
  lingua: "IT" as LinguaEnum
};

const validPsp2: Psp = {
  id: 40001,
  idPsp: "idPsp1",
  businessName: "Red bank",
  paymentType: "CP",
  idIntermediary: "idIntermediario1",
  idChannel: "idCanale14",
  logoPSP: "https://assets.io.pagopa.it/logos/abi/03015.png",
  serviceLogo: "https://assets.io.pagopa.it/logos/abi/03015.png",
  serviceName: "nomeServizio 10 red",
  fixedCost: {
    currency: "EUR",
    amount: 234,
    decimalDigits: 2
  },
  appChannel: false,
  tags: ["AMEX"],
  serviceDescription,
  serviceAvailability,
  paymentModel: 1,
  flagStamp: true,
  idCard: 91,
  lingua: "IT" as LinguaEnum
};

const validPsp3: Psp = {
  id: 40002,
  idPsp: "idPsp1",
  businessName: "Blu bank",
  paymentType: "CP",
  idIntermediary: "idIntermediario1",
  idChannel: "idCanale14",
  logoPSP: "https://assets.io.pagopa.it/logos/abi/01030.png",
  serviceLogo: "https://assets.io.pagopa.it/logos/abi/01030.png",
  serviceName: "nomeServizio 10 Blu",
  fixedCost: {
    currency: "EUR",
    amount: 567,
    decimalDigits: 2
  },
  appChannel: false,
  tags: ["MASTERCARD", "POSTE"],
  serviceDescription,
  serviceAvailability,
  paymentModel: 1,
  flagStamp: true,
  idCard: 91,
  lingua: "IT" as LinguaEnum
};
export const pspListV2 = validatePayload(
  PspDataListResponse,
  readFileAsJSON(assetsFolder + "/pm/psp/pspV2.json")
);
// psp v1 and v2 should have always the same IDPSP, ID and NAME
export const pspListV1: ReadonlyArray<Psp> = [
  validPsp,
  validPsp2,
  validPsp3
].map((item, idx) => {
  const pspV2 = pspListV2.data[idx];
  return {
    ...item,
    idPsp: pspV2.idPsp,
    id: pspV2.id,
    businessName: pspV2.ragioneSociale
  };
});
export const getWallets = (count = 4): WalletListResponse => {
  // eslint-disable-next-line functional/no-let
  let walletId = 0;
  // eslint-disable-next-line functional/no-let
  let creditCardId = 0;
  const generateCreditCard = (): CreditCard => {
    const ccBrand = getRandomValue(
      creditCardBrands[0],
      faker.helpers.arrayElement(creditCardBrands),
      "wallet"
    );
    creditCardId++;
    const expDate = faker.date.future();
    return {
      id: creditCardId,
      brand: ccBrand,
      holder: `${faker.person.firstName()} ${faker.person.lastName()}`,
      pan: `************${getRandomValue(
        faker.number.int(9999).toString().padStart(4, "0"),
        creditCardId.toString().padStart(4, "0"),
        "wallet"
      )}`,
      expireMonth: (expDate.getMonth() + 1).toString().padStart(2, "0"),
      expireYear: expDate.getFullYear().toString().substr(2),
      brandLogo: getCreditCardLogo(ccBrand),
      flag3dsVerified: true
    };
  };

  const generateWallet = (): Wallet => {
    walletId++;

    return {
      idWallet: walletId,
      type: TypeEnum.CREDIT_CARD,
      favourite: false,
      creditCard: generateCreditCard(),
      // psp: validPsp,
      idPsp: validPsp.id,
      pspEditable: true,
      lastUsage: new Date()
    };
  };

  const data = {
    data: count > 0 ? range(1, count).map(generateWallet) : []
  };

  return validatePayload(WalletListResponse, data);
};

export const getTransactions = (
  count: number,
  confirmed = true,
  wallets?: ReadonlyArray<Wallet>
): ReadonlyArray<Transaction> => {
  if (wallets?.length === 0) {
    return [];
  }
  return count > 0
    ? range(1, count)
        .map(idx => {
          const amount: number = getRandomValue(
            20000 + idx * 10,
            faker.number.int({ min: 100, max: 20000 }),
            "wallet"
          );
          const fee: number = getRandomValue(
            100,
            faker.number.int({ min: 1, max: 150 }),
            "wallet"
          );
          const transactionId = getRandomValue(
            idx,
            faker.number.int(1000000),
            "wallet"
          );
          const transactionDescription = getRandomValue(
            `transaction - ${idx}`,
            faker.finance.transactionDescription(),
            "wallet"
          );
          const description = `/RFB/${transactionId}/${
            amount / 100
          }/TXT/${transactionDescription}`;
          const delta = 1000 * 60 * 60;
          const now = new Date();
          const created = getRandomValue(
            new Date(now.getTime() + idx * delta),
            faker.date.past(),
            "wallet"
          );
          const merchant = getRandomValue(
            `merchant-${idx}`,
            faker.company.name(),
            "wallet"
          );
          return validatePayload(Transaction, {
            // 1 === transaction confirmed!
            accountingStatus: confirmed ? 1 : 0,
            amount: { amount },
            created,
            description,
            error: false,
            fee: { amount: fee },
            grandTotal: { amount: amount + fee },
            id: idx,
            idPayment: 1,
            idPsp: pipe(
              O.fromNullable(wallets),
              O.map(ws => Number(ws[idx % ws.length].idPsp)),
              O.getOrElse(() => faker.number.int(10000))
            ),
            idStatus: 3,
            idWallet: pipe(
              O.fromNullable(wallets),
              O.map(ws => ws[idx % ws.length].idWallet),
              O.toUndefined
            ),
            merchant,
            nodoIdPayment: "nodoIdPayment",
            paymentModel: 5,
            spcNodeDescription: "spcNodeDescription",
            spcNodeStatus: 6,
            statusMessage: "statusMessage",
            success: true,
            token: "token",
            updated: undefined,
            urlCheckout3ds: "urlCheckout3ds",
            urlRedirectPSP: "urlRedirectPSP"
          });
        })
        .reverse()
    : [];
};

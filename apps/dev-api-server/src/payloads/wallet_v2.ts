import { fakerIT as faker } from "@faker-js/faker";
import { EnableableFunctionsEnum } from "@io-app/api-types/generated/definitions/pagopa/EnableableFunctions";
import { PayPalAccountPspInfo } from "@io-app/api-types/generated/definitions/pagopa/PayPalAccountPspInfo";
import { PayPalInfo } from "@io-app/api-types/generated/definitions/pagopa/PayPalInfo";
import {
  Wallet,
  TypeEnum as WalletV1TypeEnum
} from "@io-app/api-types/generated/definitions/pagopa/Wallet";
import {
  WalletTypeEnum,
  WalletV2
} from "@io-app/api-types/generated/definitions/pagopa/WalletV2";
import { Abi } from "@io-app/api-types/generated/definitions/pagopa/walletv2/Abi";
import { BPay } from "@io-app/api-types/generated/definitions/pagopa/walletv2/BPay";
import { BPayInfo } from "@io-app/api-types/generated/definitions/pagopa/walletv2/BPayInfo";
import {
  Card,
  ProductTypeEnum,
  ValidityStateEnum
} from "@io-app/api-types/generated/definitions/pagopa/walletv2/Card";
import {
  CardInfo,
  TypeEnum
} from "@io-app/api-types/generated/definitions/pagopa/walletv2/CardInfo";
import { SatispayInfo } from "@io-app/api-types/generated/definitions/pagopa/walletv2/SatispayInfo";
import { format } from "date-fns";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { range } from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";
import * as t from "io-ts";
import sha256 from "sha256";
import { match } from "ts-pattern";

import { assetsFolder, ioDevServerConfig } from "../config";
import { getAuthenticationProvider } from "../persistence/sessionInfo";
import { readFileAsJSON } from "../utils/file";
import { isDefined } from "../utils/guards";
import {
  CreditCardBrandEnum,
  creditCardBrands,
  getCreditCardLogo
} from "../utils/payment";
import { getRandomValue } from "../utils/random";
import { validatePayload } from "../utils/validator";
import { getProfileInitialData } from "./profile";

type CardConfig = {
  index: number;
  prefix: string;
};

// eslint-disable-next-line functional/no-let
let defaultCardConfig: CardConfig = { prefix: "00000000000", index: 0 };

// eslint-disable-next-line functional/no-let
let incrementalIdWallet = 1;
const getNextIdWallet = (): number => {
  incrementalIdWallet++;
  return incrementalIdWallet;
};

const cardConfigMap: Map<WalletTypeEnum, CardConfig> = new Map<
  WalletTypeEnum,
  CardConfig
>([
  [WalletTypeEnum.Bancomat, { prefix: "123400005678", index: 0 }],
  [WalletTypeEnum.BPay, { prefix: "123456780000", index: 0 }],
  [WalletTypeEnum.Card, { prefix: "000012345678", index: 0 }],
  [WalletTypeEnum.PayPal, { prefix: "email", index: 0 }],
  [WalletTypeEnum.Satispay, { prefix: "125678000034", index: 0 }]
]);

export const resetCardConfig = () => {
  cardConfigMap.forEach((v, k) => cardConfigMap.set(k, { ...v, index: 0 }));
};

export const generateSatispayInfo = (
  count: number
): ReadonlyArray<SatispayInfo> =>
  count > 0
    ? range(1, count).map(_ => {
        const config = pipe(
          O.fromNullable(cardConfigMap.get(WalletTypeEnum.Satispay)),
          O.getOrElse(() => defaultCardConfig)
        );
        const uuid = sha256(
          config.prefix + config.index.toString().padStart(4, "0")
        );
        cardConfigMap.set(WalletTypeEnum.Satispay, {
          ...config,
          index: config.index + 1
        });
        return {
          uuid
        };
      })
    : [];

export const generatePaypalInfo = (count: number): ReadonlyArray<PayPalInfo> =>
  count > 0
    ? range(1, count).map(_ => {
        const config = pipe(
          O.fromNullable(cardConfigMap.get(WalletTypeEnum.PayPal)),
          O.getOrElse(() => defaultCardConfig)
        );
        const emailPp = `${config.prefix}.${config.index.toString()}@paypal.it`;
        cardConfigMap.set(WalletTypeEnum.PayPal, {
          ...config,
          index: config.index + 1
        });
        const maybePspResponse = validatePayload(
          t.readonlyArray(PayPalAccountPspInfo),
          readFileAsJSON(assetsFolder + "/pm/paypal/psp_account.json")
        );
        return {
          // inject the email
          pspInfo: maybePspResponse.map(p => ({ ...p, email: emailPp }))
        };
      })
    : [];

export const satispay = {
  hasMore: false,
  token: sha256("token"),
  uidSatispay: "uidSatispay",
  uidSatispayHash: sha256("uidSatispay")
};

export const generateBancomatPay = (
  abis: ReadonlyArray<Abi>,
  count: number
): ReadonlyArray<BPay> => {
  const shuffledAbis = faker.helpers.shuffle([...abis]);
  return count > 0
    ? range(1, count).map((_, idx) => {
        const config = pipe(
          O.fromNullable(cardConfigMap.get(WalletTypeEnum.BPay)),
          O.getOrElse(() => defaultCardConfig)
        );
        const suffix = config.index.toString().padStart(4, "0");
        const cn = config.prefix + suffix;
        const uidHash = sha256(cn);
        cardConfigMap.set(WalletTypeEnum.BPay, {
          ...config,
          index: config.index + 1
        });
        return {
          bankName: faker.company.name(),
          instituteCode: shuffledAbis[idx % shuffledAbis.length].abi,
          numberObfuscated: "+3934" + "*".repeat(7) + suffix,
          paymentInstruments: [],
          serviceState: "ATT",
          uidHash
        };
      })
    : [];
};

export const isCobadge = (wallet: WalletV2, card: CardInfo) =>
  wallet.walletType === WalletTypeEnum.Card &&
  wallet.pagoPA === false &&
  card.issuerAbiCode !== undefined;

export const isPrivative = (wallet: WalletV2, card: CardInfo) =>
  wallet.walletType === WalletTypeEnum.Card &&
  wallet.pagoPA === false &&
  card.type === TypeEnum.PRV;

export const generateCards = (
  abis: ReadonlyArray<Abi>,
  count = 10,
  cardType: WalletTypeEnum.Bancomat | WalletTypeEnum.Card
): ReadonlyArray<CardInfo> => {
  const listAbi = ioDevServerConfig.wallet.shuffleAbi
    ? faker.helpers.shuffle([...abis])
    : abis;

  return count > 0
    ? range(1, Math.min(count, abis.length)).map<CardInfo>((_, idx) => {
        const config = pipe(
          O.fromNullable(cardConfigMap.get(cardType)),
          O.getOrElse(() => defaultCardConfig)
        );
        const cn = config.prefix + config.index.toString().padStart(4, "0");
        if (cardConfigMap.get(cardType)) {
          cardConfigMap.set(cardType, { ...config, index: config.index + 1 });
        } else {
          defaultCardConfig = { ...config, index: config.index + 1 };
        }
        const ed = faker.date.future();
        return {
          abi: listAbi[idx % listAbi.length].abi,
          cardNumber: cn,
          cardPartialNumber: cn.slice(-4),
          expiringDate: ed.toISOString(),
          hpan: sha256(cn),
          productType: ProductTypeEnum.PP,
          tokens: ["token1", "token2"],
          validityState: ValidityStateEnum.V
        };
      })
    : [];
};

const maybeAbiList = t
  .readonlyArray(Abi)
  .decode(readFileAsJSON(assetsFolder + "/data/abi.json").data);
if (E.isLeft(maybeAbiList)) {
  throw Error("invalid abi list");
}
const abiCodes = (maybeAbiList.right ?? [])
  .map((a: Abi) => a.abi)
  .filter(isDefined);
// eslint-disable-next-line functional/no-let
let millis = new Date().getTime();
export const abiData = range(1, abiCodes.length - 1).map<Abi>(_ => {
  faker.seed(millis++);
  return {
    abi: abiCodes[
      faker.number.int({ min: 0, max: abiCodes.length - 1 })
    ].replace(".png", ""),
    name: faker.company.name()
  };
});

export const convertWalletV2toV1 = (wallet: WalletV2): undefined | Wallet =>
  // a favourite method can be only a CreditCard, PayPal or BancomatPay
  match(wallet.walletType)
    .with(WalletTypeEnum.Card, () =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      generateWalletV1FromCardInfo(wallet.idWallet!, wallet.info as CardInfo)
    )
    .with(WalletTypeEnum.PayPal, () =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      generateWalletV1FromPayPal(wallet.idWallet!)
    )
    .with(WalletTypeEnum.BPay, () =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      generateWalletV1FromBPay(wallet.idWallet!, wallet.info)
    )
    .otherwise(() => undefined);

const dateFormat = "yyyy-MM-dd";

export const generateWalletV2FromCard = (
  card: Card,
  walletType: WalletTypeEnum,
  canMethodPay: boolean,
  enableableFunctions: ReadonlyArray<EnableableFunctionsEnum> = [
    EnableableFunctionsEnum.FA,
    EnableableFunctionsEnum.pagoPA,
    EnableableFunctionsEnum.BPD
  ]
): WalletV2 => {
  const ed = card.expiringDate
    ? new Date(card.expiringDate)
    : faker.date.future();
  const ccBrand = getRandomValue(
    CreditCardBrandEnum.MAESTRO,
    faker.helpers.arrayElement(creditCardBrands),
    "wallet"
  );

  const profile = getProfileInitialData(getAuthenticationProvider());
  const info = {
    blurredNumber: card.cardPartialNumber,
    brand: ccBrand,
    brandLogo: getCreditCardLogo(ccBrand),
    expireMonth: (ed.getMonth() + 1).toString().padStart(2, "0"),
    expireYear: ed.getFullYear().toString(),
    hashPan: card.hpan,
    holder: `${profile.name} ${profile.family_name}`,
    htokenList: card.tokens,
    issuerAbiCode: canMethodPay ? undefined : card.abi,
    type: TypeEnum.PP
  };

  return {
    walletType,
    // force createDate to be a string because we need to force a specific date format
    createDate: format(ed, dateFormat) as unknown as Date,
    enableableFunctions,
    favourite: false,
    idWallet: getNextIdWallet(),
    info,
    onboardingChannel: "IO",
    pagoPA: canMethodPay,
    updateDate: format(new Date(), dateFormat) as unknown as Date
  };
};

export const privativeIssuers: ReadonlyArray<string> = [
  "ESSEL",
  "COOP1",
  "CONAD"
];
export const generatePrivativeFromWalletV2 = (
  w2: WalletV2,
  idx: number
): WalletV2 => ({
  ...w2,
  info: {
    ...w2.info,
    issuerAbiCode: privativeIssuers[idx % privativeIssuers.length],
    type: TypeEnum.PRV
  }
});

export const generateWalletV2FromSatispayOrBancomatPay = (
  info: BPayInfo | SatispayInfo,
  walletType: WalletTypeEnum.BPay | WalletTypeEnum.Satispay,
  enableableFunctions: ReadonlyArray<EnableableFunctionsEnum> = [
    EnableableFunctionsEnum.FA,
    EnableableFunctionsEnum.pagoPA,
    EnableableFunctionsEnum.BPD
  ],
  canPay = false
): WalletV2 => {
  const ed = faker.date.future();
  return {
    walletType,
    // force createDate to be a string because we need to force a specific date format
    createDate: format(ed, dateFormat) as unknown as Date,
    enableableFunctions,
    favourite: false,
    idWallet: getNextIdWallet(),
    info,
    onboardingChannel: "IO",
    pagoPA: canPay,
    updateDate: format(new Date(), dateFormat) as unknown as Date
  };
};

export const generateWalletV2FromPaypal = (
  info: PayPalInfo,
  enableableFunctions: ReadonlyArray<EnableableFunctionsEnum> = [
    EnableableFunctionsEnum.FA,
    EnableableFunctionsEnum.pagoPA,
    EnableableFunctionsEnum.BPD
  ]
): WalletV2 => {
  const ed = faker.date.future();
  return {
    walletType: WalletTypeEnum.PayPal,
    // force createDate to be a string because we need to force a specific date format
    createDate: format(ed, dateFormat) as unknown as Date,
    enableableFunctions,
    favourite: false,
    idWallet: getNextIdWallet(),
    info,
    onboardingChannel: "IO",
    pagoPA: enableableFunctions.includes(EnableableFunctionsEnum.pagoPA),
    updateDate: format(new Date(), dateFormat) as unknown as Date
  };
};

const generateWalletV1FromPayPal = (idWallet: number): Wallet => ({
  idWallet,
  type: WalletV1TypeEnum.EXTERNAL_PS,
  favourite: false,
  pspEditable: true,
  isPspToIgnore: false,
  saved: false,
  registeredNexi: false
});

const generateWalletV1FromCardInfo = (
  idWallet: number,
  info: CardInfo
): Wallet => ({
  idWallet,
  type: WalletV1TypeEnum.CREDIT_CARD,
  favourite: false,
  creditCard: {
    id: idWallet,
    holder: info.holder,
    pan: "*".repeat(12) + (info.blurredNumber ?? ""),
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expireMonth: info.expireMonth!.padStart(2, "0"),
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expireYear: info.expireYear!.slice(-2),
    brandLogo: info.brandLogo,
    flag3dsVerified: false,
    brand: info.brand,
    onUs: false
  },
  pspEditable: true,
  isPspToIgnore: false,
  saved: false,
  registeredNexi: false
});

const generateWalletV1FromBPay = (
  idWallet: number,
  info: BPayInfo | undefined
): Wallet => ({
  idWallet,
  type: WalletV1TypeEnum.EXTERNAL_PS,
  favourite: false,
  bPay: info,
  pspEditable: true,
  isPspToIgnore: false,
  saved: false,
  registeredNexi: false
});

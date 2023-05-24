// 2 bancomat, 1 credit card. All compliant with pagoPa
import { WalletTypeEnum } from "../../../../../definitions/pagopa/WalletV2";
import { PaymentMethod, RawBPayPaymentMethod } from "../../../../types/pagopa";
import { EnableableFunctionsEnum } from "../../../../../definitions/pagopa/EnableableFunctions";
import { TypeEnum } from "../../../../../definitions/pagopa/walletv2/CardInfo";

export const walletsV2_1 = {
  data: [
    {
      walletType: "Bancomat",
      createDate: "2021-08-28",
      enableableFunctions: [
        EnableableFunctionsEnum.FA,
        EnableableFunctionsEnum.pagoPA,
        EnableableFunctionsEnum.BPD
      ],
      favourite: false,
      idWallet: 23190,
      info: {
        blurredNumber: "0003",
        brand: "MASTERCARD",
        brandLogo:
          "https://wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_mc.png",
        expireMonth: "8",
        expireYear: "2021",
        hashPan:
          "e105a87731025d54181d8e4c4c04ff344ce82e57d6a3d6c6911e8eadb0348d7b",
        holder: "Maria Rossi",
        htokenList: ["token1", "token2"],
        issuerAbiCode: "00213",
        type: "PP"
      },
      onboardingChannel: "I",
      pagoPA: true,
      updateDate: "2020-11-16"
    },
    {
      walletType: "Bancomat",
      createDate: "2021-07-22",
      enableableFunctions: [
        EnableableFunctionsEnum.FA,
        EnableableFunctionsEnum.pagoPA,
        EnableableFunctionsEnum.BPD
      ],
      favourite: false,
      idWallet: 29371,
      info: {
        blurredNumber: "0004",
        brand: "AMEX",
        brandLogo:
          "https://wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_amex.png",
        expireMonth: "7",
        expireYear: "2021",
        hashPan:
          "a591ab131bd9492e6df0357f1ac52785a96ddc8e772baddbb02e2169af9474f4",
        holder: "Maria Rossi",
        htokenList: ["token1", "token2"],
        issuerAbiCode: "00289",
        type: "PP"
      },
      onboardingChannel: "I",
      pagoPA: true,
      updateDate: "2020-11-16"
    },
    {
      walletType: "Card",
      createDate: "2020-12-28",
      enableableFunctions: [
        EnableableFunctionsEnum.FA,
        EnableableFunctionsEnum.pagoPA,
        EnableableFunctionsEnum.BPD
      ],
      favourite: false,
      idWallet: 23216,
      info: {
        blurredNumber: "0000",
        brand: "DINERS",
        brandLogo:
          "https://wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_diners.png",
        expireMonth: "12",
        expireYear: "2020",
        hashPan:
          "853afb770973eb48d5d275778bd124b28f60a684c20bcdf05dc8f0014c7ce871",
        holder: "Maria Rossi",
        htokenList: ["token1", "token2"],
        issuerAbiCode: "00027",
        type: "PP"
      },
      onboardingChannel: "I",
      pagoPA: true,
      updateDate: "2020-11-16"
    }
  ]
};
// 1 bancomat, 1 credit card. No compliant with pagoPa
export const walletsV2_2 = {
  data: [
    {
      walletType: "Bancomat",
      createDate: "2021-08-28",
      enableableFunctions: [
        EnableableFunctionsEnum.FA,
        EnableableFunctionsEnum.pagoPA,
        EnableableFunctionsEnum.BPD
      ],
      favourite: false,
      idWallet: 23190,
      info: {
        blurredNumber: "0003",
        brand: "MASTERCARD",
        brandLogo:
          "https://wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_mc.png",
        expireMonth: "8",
        expireYear: "2021",
        hashPan:
          "e105a87731025d54181d8e4c4c04ff344ce82e57d6a3d6c6911e8eadb0348d7b",
        holder: "Maria Rossi",
        htokenList: ["token1", "token2"],
        issuerAbiCode: "00213",
        type: "PP"
      },
      onboardingChannel: "I",
      pagoPA: false,
      updateDate: "2020-11-16"
    },
    {
      walletType: "Card",
      createDate: "2020-12-28",
      enableableFunctions: [
        EnableableFunctionsEnum.FA,
        EnableableFunctionsEnum.pagoPA,
        EnableableFunctionsEnum.BPD
      ],
      favourite: false,
      idWallet: 23216,
      info: {
        blurredNumber: "0000",
        brand: "DINERS",
        brandLogo:
          "https://wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_diners.png",
        expireMonth: "12",
        expireYear: "2020",
        hashPan:
          "853afb770973eb48d5d275778bd124b28f60a684c20bcdf05dc8f0014c7ce871",
        holder: "Maria Rossi",
        htokenList: ["token1", "token2"],
        issuerAbiCode: "00027",
        type: "PP"
      },
      onboardingChannel: "I",
      pagoPA: false,
      updateDate: "2020-11-16"
    }
  ]
};

// 1 bancomat, 1 bancomatPay, 1 satispay, 1 creditCard
export const walletsV2_3 = {
  data: [
    {
      walletType: "Bancomat",
      createDate: "2021-10-22",
      enableableFunctions: [
        EnableableFunctionsEnum.FA,
        EnableableFunctionsEnum.pagoPA,
        EnableableFunctionsEnum.BPD
      ],
      favourite: false,
      idWallet: 20341,
      info: {
        blurredNumber: "0003",
        brand: "MASTERCARD",
        brandLogo:
          "https://wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_mc.png",
        expireMonth: "10",
        expireYear: "2021",
        hashPan:
          "e105a87731025d54181d8e4c4c04ff344ce82e57d6a3d6c6911e8eadb0348d7b",
        holder: "Maria Rossi",
        htokenList: ["token1", "token2"],
        issuerAbiCode: "00095",
        type: "PP"
      },
      onboardingChannel: "I",
      pagoPA: true,
      updateDate: "2020-11-20"
    },
    {
      walletType: "Card",
      createDate: "2021-04-15",
      enableableFunctions: [
        EnableableFunctionsEnum.FA,
        EnableableFunctionsEnum.pagoPA,
        EnableableFunctionsEnum.BPD
      ],
      favourite: false,
      idWallet: 21750,
      info: {
        blurredNumber: "0000",
        brand: "DINERS",
        brandLogo:
          "https://wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_diners.png",
        expireMonth: "4",
        expireYear: "2021",
        hashPan:
          "853afb770973eb48d5d275778bd124b28f60a684c20bcdf05dc8f0014c7ce871",
        holder: "Maria Rossi",
        htokenList: ["token1", "token2"],
        issuerAbiCode: "00352",
        type: "PP"
      },
      onboardingChannel: "I",
      pagoPA: true,
      updateDate: "2020-11-20"
    },
    {
      walletType: "Satispay",
      createDate: "2021-11-16",
      enableableFunctions: [
        EnableableFunctionsEnum.FA,
        EnableableFunctionsEnum.pagoPA,
        EnableableFunctionsEnum.BPD
      ],
      favourite: false,
      idWallet: 25924,
      info: {
        brandLogo: "http://placeimg.com/640/480/technics",
        uuid: "2f969cf41246000a4f5a3b6e100e1826bd58205a0feba80f64c2a853fb8f4fa50000"
      },
      onboardingChannel: "I",
      pagoPA: true,
      updateDate: "2020-11-20"
    },
    {
      walletType: "BPay",
      createDate: "2021-07-08",
      enableableFunctions: [
        EnableableFunctionsEnum.FA,
        EnableableFunctionsEnum.pagoPA,
        EnableableFunctionsEnum.BPD
      ],
      favourite: false,
      idWallet: 25572,
      info: {
        bankName: "Denti, Visintin and Galati",
        instituteCode: "4",
        numberObfuscated: "****0004",
        paymentInstruments: [],
        uidHash:
          "d48a59cdfbe3da7e4fe25e28cbb47d5747720ecc6fc392c87f1636fe95db22f90004"
      },
      onboardingChannel: "I",
      pagoPA: true,
      updateDate: "2020-11-20"
    }
  ]
};

export const rawBPay: RawBPayPaymentMethod = {
  walletType: WalletTypeEnum.BPay,
  createDate: "2021-07-08",
  enableableFunctions: [
    EnableableFunctionsEnum.FA,
    EnableableFunctionsEnum.pagoPA,
    EnableableFunctionsEnum.BPD
  ],
  favourite: false,
  idWallet: 1,
  info: {
    bankName: "Denti, Visintin and Galati",
    instituteCode: "4",
    numberObfuscated: "+3934****0004",
    paymentInstruments: [],
    uidHash:
      "d48a59cdfbe3da7e4fe25e28cbb47d5747720ecc6fc392c87f1636fe95db22f90004"
  },
  onboardingChannel: "I",
  pagoPA: true,
  updateDate: "2020-11-20",
  kind: "BPay"
};

export const mockCreditCardPaymentMethod: PaymentMethod = {
  walletType: WalletTypeEnum.Card,
  createDate: "2021-07-08",
  enableableFunctions: [
    EnableableFunctionsEnum.FA,
    EnableableFunctionsEnum.pagoPA,
    EnableableFunctionsEnum.BPD
  ],
  favourite: false,
  idWallet: 25572,
  info: {
    blurredNumber: "0001",
    brand: "Maestro",
    brandLogo:
      "https://wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_maestro.png",
    expireMonth: "11",
    expireYear: "2021",
    hashPan:
      "d48a59cdfbe3da7e4fe25e28cbb47d5747720ecc6fc392c87f1636fe95db22f90004",
    holder: "Maria Rossi",
    htokenList: ["token1", "token2"],
    issuerAbiCode: "ABICODE",
    type: TypeEnum.DEB
  },
  onboardingChannel: "IO",
  pagoPA: false,
  updateDate: "2020-11-20",
  kind: "CreditCard",
  caption: "●●●●0001",
  icon: 37
};

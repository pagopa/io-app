import { WalletTypeEnum } from "../../../../../../../definitions/pagopa/WalletV2";
import { PatchedWalletV2 } from "../../../../../../types/pagopa";
import { EnableableFunctionsEnum } from "../../../../../../../definitions/pagopa/EnableableFunctions";

export const bancomat = {
  walletType: WalletTypeEnum.Bancomat,
  createDate: "2021-04-05",
  enableableFunctions: [EnableableFunctionsEnum.BPD],
  favourite: false,
  idWallet: 24415,
  info: {
    blurredNumber: "0003",
    brand: "MASTERCARD",
    brandLogo:
      "https://wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_mc.png",
    expireMonth: "4",
    expireYear: "2021",
    hashPan: "e105a87731025d54181d8e4c4c04ff344ce82e57d6a3d6c6911e8eadb0348d7b",
    holder: "Maria Rossi",
    htokenList: ["token1", "token2"],
    issuerAbiCode: "00123",
    type: "PP"
  },
  onboardingChannel: "I",
  pagoPA: true,
  updateDate: "2021-04-05"
} as PatchedWalletV2;

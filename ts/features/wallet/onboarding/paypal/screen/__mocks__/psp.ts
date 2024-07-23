import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { IOPayPalPsp } from "../../types";

const mockPrivacyUrl = "https://io.italia.it/app-content/tos_privacy.html";

export const pspList: ReadonlyArray<IOPayPalPsp> = [
  {
    id: "1",
    logoUrl: "https://paytipper.com/wp-content/uploads/2021/02/logo.png",
    name: "PayTipper",
    fee: 100 as NonNegativeNumber,
    privacyUrl: mockPrivacyUrl
  },
  {
    id: "2",
    logoUrl: "https://www.dropbox.com/s/smk5cyxx1qevn6a/mat_bank.png?dl=1",
    name: "Mat Bank",
    fee: 50 as NonNegativeNumber,
    privacyUrl: mockPrivacyUrl
  }
];

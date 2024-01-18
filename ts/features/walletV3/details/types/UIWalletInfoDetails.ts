import {
  PatternString,
  WithinRangeString
} from "@pagopa/ts-commons/lib/strings";
import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";
import { BrandEnum } from "../../../../../definitions/pagopa/walletv3/WalletInfoDetails";

const UIWalletInfoDetails = t.partial({
  maskedPan: t.string,

  expiryDate: PatternString("^d{6}$"),

  holder: t.string,

  brand: enumType<BrandEnum>(BrandEnum, "brand"),

  abi: WithinRangeString(1, 6),

  maskedEmail: t.string,

  maskedNumber: WithinRangeString(1, 21),

  instituteCode: WithinRangeString(1, 6),

  bankName: t.string
});

export type UIWalletInfoDetails = t.TypeOf<typeof UIWalletInfoDetails>;

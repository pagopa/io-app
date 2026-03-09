import * as t from "io-ts";
import {
  WalletInfoDetails1,
  WalletInfoDetails2,
  WalletInfoDetails3
} from "../../../../../definitions/pagopa/ecommerce/WalletInfoDetails";

/**
 * Transforms all required props from WalletInfoDetails1 to partial
 */
const UIWalletInfoDetails1 = t.partial({
  ...WalletInfoDetails1.types[0].props,
  ...WalletInfoDetails1.types[0].props
});

/**
 * Transforms all required props from WalletInfoDetails2 to partial
 */
const UIWalletInfoDetails2 = t.partial({
  ...WalletInfoDetails2.types[0].props,
  ...WalletInfoDetails2.types[1].props
});

/**
 * Transforms all required props from WalletInfoDetails3 to partial
 */
const UIWalletInfoDetails3 = t.partial({
  ...WalletInfoDetails3.types[0].props,
  ...WalletInfoDetails3.types[1].props
});

/**
 * This type is used to bypass the `type` props of {@see WalletInfoDetails}
 */
export const UIWalletInfoDetails = t.intersection(
  [UIWalletInfoDetails1, UIWalletInfoDetails2, UIWalletInfoDetails3],
  "UIWalletInfoDetails"
);

export type UIWalletInfoDetails = t.TypeOf<typeof UIWalletInfoDetails>;

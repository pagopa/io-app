import * as React from "react";
import { PaymentMethod } from "../../../../../types/pagopa";
import { hasFunctionEnabled } from "../../../../../utils/walletv2";
import { HPan } from "../../store/actions/paymentMethods";
import { getPaymentMethodHash } from "../../../../../utils/paymentMethod";
import { EnableableFunctionsEnum } from "../../../../../../definitions/pagopa/EnableableFunctions";
import PaymentMethodBpdToggle from "./base/PaymentMethodBpdToggle";

/**
 * Return a specific toggle based on the WalletTypeEnum
 * @param paymentMethod
 */
export const bpdToggleFactory = (paymentMethod: PaymentMethod) => {
  const hash = getPaymentMethodHash(paymentMethod);
  return hash ? (
    <PaymentMethodBpdToggle
      key={hash}
      hPan={hash as HPan}
      icon={paymentMethod.icon}
      hasBpdCapability={hasFunctionEnabled(
        paymentMethod,
        EnableableFunctionsEnum.BPD
      )}
      caption={paymentMethod.caption}
    />
  ) : null;
};

import React from "react";
import { VSpacer } from "@pagopa/io-app-design-system";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import I18n from "../../../../i18n";
import { WALLET_PAYMENT_SHOW_OTHER_CHANNELS_URL } from "../utils";
import IOMarkdown from "../../../../components/IOMarkdown";

export const usePaymentReversedInfoBottomSheet = () => {
  const getModalContent = () => (
    <>
      <IOMarkdown
        content={I18n.t(
          "features.payments.checkout.bottomSheet.PAYMENT_REVERSED.payNotice",
          {
            url: WALLET_PAYMENT_SHOW_OTHER_CHANNELS_URL
          }
        )}
      />
      <VSpacer size={24} />
      <IOMarkdown
        content={I18n.t(
          "features.payments.checkout.bottomSheet.PAYMENT_REVERSED.waitRefund"
        )}
      />
      <VSpacer size={24} />
      <IOMarkdown
        content={I18n.t(
          "features.payments.checkout.bottomSheet.PAYMENT_REVERSED.contactSupport"
        )}
      />
      <VSpacer size={24} />
    </>
  );

  const modal = useIOBottomSheetAutoresizableModal({
    component: getModalContent(),
    title: I18n.t(
      "features.payments.checkout.bottomSheet.PAYMENT_REVERSED.title"
    )
  });

  return { ...modal };
};

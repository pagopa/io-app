import { IOMarkdownLite, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { WALLET_PAYMENT_SHOW_OTHER_CHANNELS_URL } from "../utils";

export const usePaymentReversedInfoBottomSheet = () => {
  const getModalContent = () => (
    <>
      <IOMarkdownLite
        content={I18n.t(
          "features.payments.checkout.bottomSheet.PAYMENT_REVERSED.payNotice",
          {
            url: WALLET_PAYMENT_SHOW_OTHER_CHANNELS_URL
          }
        )}
      />
      <VSpacer size={24} />
      <IOMarkdownLite
        content={I18n.t(
          "features.payments.checkout.bottomSheet.PAYMENT_REVERSED.waitRefund"
        )}
      />
      <VSpacer size={24} />
      <IOMarkdownLite
        content={I18n.t(
          "features.payments.checkout.bottomSheet.PAYMENT_REVERSED.contactSupport"
        )}
      />
      <VSpacer size={24} />
    </>
  );

  const modal = useIOBottomSheetModal({
    component: getModalContent(),
    title: I18n.t(
      "features.payments.checkout.bottomSheet.PAYMENT_REVERSED.title"
    )
  });

  return { ...modal };
};

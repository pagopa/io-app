import React from "react";
import { VSpacer } from "@pagopa/io-app-design-system";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import I18n from "../../../../i18n";
import { ParagraphWithTitle } from "../../common/components/ParagraphWithTitle";

export const usePaymentReversedInfoBottomSheet = () => {
  const getModalContent = () => (
    <>
      <ParagraphWithTitle
        title={I18n.t(
          "features.payments.checkout.bottomSheet.PAYMENT_REVERSED.payNotice.title"
        )}
        body={I18n.t(
          "features.payments.checkout.bottomSheet.PAYMENT_REVERSED.payNotice.content"
        )}
      />
      <VSpacer size={24} />
      <ParagraphWithTitle
        title={I18n.t(
          "features.payments.checkout.bottomSheet.PAYMENT_REVERSED.waitRefund.title"
        )}
        body={I18n.t(
          "features.payments.checkout.bottomSheet.PAYMENT_REVERSED.waitRefund.content"
        )}
      />
      <VSpacer size={24} />
      <ParagraphWithTitle
        title={I18n.t(
          "features.payments.checkout.bottomSheet.PAYMENT_REVERSED.contactSupport.title"
        )}
        body={I18n.t(
          "features.payments.checkout.bottomSheet.PAYMENT_REVERSED.contactSupport.content"
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

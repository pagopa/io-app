import React from "react";
import { Body, LabelLink, VSpacer } from "@pagopa/io-app-design-system";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import I18n from "../../../../i18n";
import { ParagraphWithTitle } from "../../common/components/ParagraphWithTitle";
import { openWebUrl } from "../../../../utils/url";
import { WALLET_PAYMENT_SHOW_OTHER_CHANNELS_URL } from "../utils";

export const usePaymentReversedInfoBottomSheet = () => {
  const handleOnPressLink = () => {
    openWebUrl(WALLET_PAYMENT_SHOW_OTHER_CHANNELS_URL);
  };

  const getModalContent = () => (
    <>
      <ParagraphWithTitle
        title={I18n.t(
          "features.payments.checkout.bottomSheet.PAYMENT_REVERSED.payNotice.title"
        )}
        body={
          <>
            <Body>
              {I18n.t(
                "features.payments.checkout.bottomSheet.PAYMENT_REVERSED.payNotice.content"
              )}
            </Body>{" "}
            <LabelLink onPress={handleOnPressLink}>
              {I18n.t(
                "features.payments.checkout.bottomSheet.PAYMENT_REVERSED.payNotice.contentLink"
              )}
            </LabelLink>
          </>
        }
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

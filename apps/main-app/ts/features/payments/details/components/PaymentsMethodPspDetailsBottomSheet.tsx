import { Body, VSpacer } from "@io-app/design-system";
import I18n from "i18next";

import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";

type PaymentsMethodPspDetailsBottomSheetProps = {
  pspBusinessName: string;
};

/**
 * This component shows information about how does it works a psp preselected
 *
 * @class
 */
const PaymentsMethodPspDetailsBottomSheet = ({
  pspBusinessName
}: PaymentsMethodPspDetailsBottomSheetProps) => (
  <>
    <Body>
      {I18n.t("features.payments.details.pspAlert.explainationContent", {
        pspBusinessName
      })}
    </Body>
    <VSpacer size={16} />
  </>
);

export const usePaymentsMethodPspDetailsBottomSheet = (
  pspBusinessName: string
) =>
  useIOBottomSheetModal({
    component: (
      <PaymentsMethodPspDetailsBottomSheet pspBusinessName={pspBusinessName} />
    ),
    title: I18n.t("features.payments.details.pspAlert.title")
  });

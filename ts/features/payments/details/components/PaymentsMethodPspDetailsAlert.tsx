import * as React from "react";
import { Alert, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { usePaymentsMethodPspDetailsBottomSheet } from "./PaymentsMethodPspDetailsBottomSheet";

type PaymentsMethodPspDetailsAlertProps = {
  pspBusinessName: string;
};

/**
 * this component shows information about how does it works a psp preselected
 * @constructor
 */
export const PaymentsMethodPspDetailsAlert = ({
  pspBusinessName
}: PaymentsMethodPspDetailsAlertProps) => {
  const {
    present: presentPspDetailsBottomSheet,
    bottomSheet: pspDetailsBottomSheet
  } = usePaymentsMethodPspDetailsBottomSheet(pspBusinessName);

  return (
    <>
      <Alert
        content={I18n.t("features.payments.details.pspAlert.description", {
          pspBusinessName
        })}
        variant="info"
        action={I18n.t("features.payments.details.pspAlert.action")}
        onPress={presentPspDetailsBottomSheet}
      />
      <VSpacer size={24} />
      {pspDetailsBottomSheet}
    </>
  );
};

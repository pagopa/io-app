import { Alert } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import Animated, { LinearTransition } from "react-native-reanimated";
import { usePaymentsMethodPspDetailsBottomSheet } from "./PaymentsMethodPspDetailsBottomSheet";
import { PaymentsMethodPspPayPalBanner } from "./PaymentsMethodPspPayPalBanner";

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
      <PaymentsMethodPspPayPalBanner />
      <Animated.View layout={LinearTransition.duration(200)}>
        <Alert
          content={I18n.t("features.payments.details.pspAlert.description", {
            pspBusinessName
          })}
          variant="info"
          action={I18n.t("features.payments.details.pspAlert.action")}
          onPress={presentPspDetailsBottomSheet}
        />
        {pspDetailsBottomSheet}
      </Animated.View>
    </>
  );
};

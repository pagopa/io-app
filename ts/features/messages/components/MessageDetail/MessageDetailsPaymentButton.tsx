import * as React from "react";
import { StyleSheet, View } from "react-native";
import {
  ButtonSolid,
  IOColors,
  IOStyles,
  IOVisualCostants
} from "@pagopa/io-app-design-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import I18n from "../../../../i18n";
import { UIMessageId } from "../../types";
import { messagePaymentDataSelector } from "../../store/reducers/detailsById";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  canNavigateToPaymentFromMessageSelector,
  paymentsButtonStateSelector
} from "../../store/reducers/payments";
import {
  gapBetweenItemsInAGrid,
  getRptIdStringFromPaymentData,
  initializeAndNavigateToWalletForPayment
} from "../../utils";
import { useIOToast } from "../../../../components/Toast";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    backgroundColor: IOColors.white,
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    paddingTop: gapBetweenItemsInAGrid,
    bottom: 0,
    width: "100%"
  }
});

type MessageDetailsPaymentButtonProps = {
  messageId: UIMessageId;
};

export const MessageDetailsPaymentButton = ({
  messageId
}: MessageDetailsPaymentButtonProps) => {
  const dispatch = useIODispatch();
  const toast = useIOToast();
  const safeAreaInsets = useSafeAreaInsets();
  const paymentData = useIOSelector(state =>
    messagePaymentDataSelector(state, messageId)
  );
  const componentVisibility = useIOSelector(state =>
    paymentsButtonStateSelector(state, messageId)
  );
  const canNavigateToPayment = useIOSelector(state =>
    canNavigateToPaymentFromMessageSelector(state)
  );
  if (!paymentData || componentVisibility === "hidden") {
    return null;
  }
  const paymentId = getRptIdStringFromPaymentData(paymentData);
  return (
    <View
      style={[
        styles.container,
        { paddingBottom: safeAreaInsets.bottom + IOStyles.footer.paddingBottom }
      ]}
    >
      <ButtonSolid
        label={I18n.t("features.messages.payments.pay")}
        accessibilityLabel={I18n.t("features.messages.payments.pay")}
        onPress={() =>
          initializeAndNavigateToWalletForPayment(
            messageId,
            paymentId,
            paymentData.amount,
            canNavigateToPayment,
            dispatch,
            false,
            () => toast.error(I18n.t("genericError"))
          )
        }
        fullWidth
        loading={componentVisibility === "loading"}
      />
    </View>
  );
};

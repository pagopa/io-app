import * as React from "react";
import { StyleSheet, View } from "react-native";
import { ButtonSolid, IOStyles, VSpacer } from "@pagopa/io-app-design-system";
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
  getRptIdStringFromPaymentData,
  initializeAndNavigateToWalletForPayment
} from "../../utils";
import { useIOToast } from "../../../../components/Toast";
import { CTAS } from "../../types/MessageCTA";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { CTAsBar } from "../../../../components/cta/CTAsBar";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    overflow: "hidden",
    bottom: 0,
    width: "100%"
  }
});

type MessageDetailsPaymentButtonProps = {
  ctas?: CTAS;
  messageId: UIMessageId;
  serviceId: ServiceId;
};

export const MessageDetailsStickyFooter = ({
  ctas,
  messageId,
  serviceId
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
  const hidePaymentButton = !paymentData || componentVisibility === "hidden";
  if (!ctas && hidePaymentButton) {
    return null;
  }
  return (
    <View
      style={[
        IOStyles.footer,
        styles.container,
        { paddingBottom: safeAreaInsets.bottom + IOStyles.footer.paddingBottom }
      ]}
    >
      {ctas && (
        <>
          <CTAsBar ctas={ctas} serviceId={serviceId} />
          {!hidePaymentButton && <VSpacer size={8} />}
        </>
      )}
      {!hidePaymentButton && (
        <ButtonSolid
          label={I18n.t("features.messages.payments.pay")}
          accessibilityLabel={I18n.t("features.messages.payments.pay")}
          onPress={() =>
            initializeAndNavigateToWalletForPayment(
              messageId,
              getRptIdStringFromPaymentData(paymentData),
              false,
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
      )}
    </View>
  );
};

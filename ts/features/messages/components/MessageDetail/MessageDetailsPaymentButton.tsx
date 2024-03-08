import * as React from "react";
import { ButtonSolid } from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import I18n from "../../../../i18n";
import { UIMessageId } from "../../types";
import { messagePaymentDataSelector } from "../../store/reducers/detailsById";
import { useIOSelector } from "../../../../store/hooks";
import { paymentsButtonStateSelector } from "../../store/reducers/payments";

type MessageDetailsPaymentButtonProps = {
  messageId: UIMessageId;
};

export const MessageDetailsPaymentButton = ({
  messageId
}: MessageDetailsPaymentButtonProps) => {
  const paymentData = useIOSelector(state =>
    messagePaymentDataSelector(state, messageId)
  );
  const componentVisibility = useIOSelector(state =>
    paymentsButtonStateSelector(state, messageId)
  );
  if (!paymentData || componentVisibility === "hidden") {
    return null;
  }
  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ paddingHorizontal: 24, paddingTop: 8 }}
    >
      <ButtonSolid
        label={I18n.t("features.messages.payments.pay")}
        accessibilityLabel={I18n.t("features.messages.payments.pay")}
        onPress={() => undefined}
        fullWidth
        loading={componentVisibility === "loading"}
      />
    </SafeAreaView>
  );
};

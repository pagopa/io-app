import React, { MutableRefObject } from "react";
import { StyleSheet, View } from "react-native";
import { ButtonSolid, IOStyles } from "@pagopa/io-app-design-system";
import I18n from "i18n-js";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { useIOSelector } from "../../../store/hooks";
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import { paymentsButtonStateSelector } from "../store/reducers/payments";
import variables from "../../../theme/variables";

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    marginTop: -variables.footerShadowOffsetHeight,
    paddingTop: variables.footerShadowOffsetHeight
  }
});

type MessageFooterProps = {
  messageId: UIMessageId;
  payments: ReadonlyArray<NotificationPaymentInfo> | undefined;
  maxVisiblePaymentCount: number;
  isCancelled: boolean;
  presentPaymentsBottomSheetRef: MutableRefObject<(() => void) | undefined>;
};

export const MessageFooter = ({
  messageId,
  payments,
  maxVisiblePaymentCount,
  isCancelled,
  presentPaymentsBottomSheetRef
}: MessageFooterProps) => {
  const buttonState = useIOSelector(state =>
    paymentsButtonStateSelector(
      state,
      messageId,
      payments,
      maxVisiblePaymentCount
    )
  );
  if (isCancelled || buttonState === "hidden") {
    return null;
  }
  // console.log(`=== MessageFooter: re-rendering`);
  const isLoading = buttonState === "visibleLoading";
  return (
    <View style={styles.container}>
      <View style={IOStyles.footer}>
        <ButtonSolid
          disabled={isLoading}
          fullWidth={true}
          loading={isLoading}
          color="primary"
          label={I18n.t("wallet.continue")}
          onPress={() => presentPaymentsBottomSheetRef.current?.()}
          accessibilityLabel={I18n.t("wallet.continue")}
        />
      </View>
    </View>
  );
};

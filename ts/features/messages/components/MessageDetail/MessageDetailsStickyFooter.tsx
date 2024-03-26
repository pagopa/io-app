import * as React from "react";
import { StyleSheet, View } from "react-native";
import { useLinkTo } from "@react-navigation/native";
import {
  ButtonLink,
  ButtonOutline,
  ButtonSolid,
  IOStyles,
  VSpacer,
  useIOToast
} from "@pagopa/io-app-design-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import I18n from "../../../../i18n";
import { PaymentData, UIMessageId } from "../../types";
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
import { CTA, CTAS } from "../../types/MessageCTA";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { trackPNOptInMessageAccepted } from "../../../pn/analytics";
import { handleCtaAction } from "../../utils/messages";

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
  firstCTAIsPNOptInMessage: boolean;
  messageId: UIMessageId;
  secondCTAIsPNOptInMessage: boolean;
  serviceId: ServiceId;
};

const RenderPaymentButton = (
  messageId: UIMessageId,
  paymentData: PaymentData,
  canNavigateToPayment: boolean,
  isLoading: boolean
) => {
  const dispatch = useIODispatch();
  const toast = useIOToast();
  return (
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
      loading={isLoading}
    />
  );
};
const renderPaymentAndSingleCTA = (
  messageId: UIMessageId,
  paymentData: PaymentData,
  canNavigateToPayment: boolean,
  isLoadingPayment: boolean,
  cta1: CTA,
  cta1IsPNOptInMessage: boolean,
  onCTAPress: (cta: CTA, isPNOptInMessage: boolean) => void
) => (
  <>
    {RenderPaymentButton(
      messageId,
      paymentData,
      canNavigateToPayment,
      isLoadingPayment
    )}
    <VSpacer size={8} />
    <ButtonLink
      accessibilityLabel={cta1.text}
      label={cta1.text}
      onPress={() => onCTAPress(cta1, cta1IsPNOptInMessage)}
    />
  </>
);
const renderDoubleCTA = (
  cta1: CTA,
  cta1IsPNOptInMessage: boolean,
  cta2: CTA,
  cta2IsPNOptInMessage: boolean,
  onCTAPress: (cta: CTA, isPNOptInMessage: boolean) => void
) => (
  <>
    <ButtonSolid
      accessibilityLabel={cta1.text}
      fullWidth
      label={cta1.text}
      onPress={() => onCTAPress(cta1, cta1IsPNOptInMessage)}
    />
    <VSpacer size={8} />
    <ButtonLink
      accessibilityLabel={cta2.text}
      label={cta2.text}
      onPress={() => onCTAPress(cta2, cta2IsPNOptInMessage)}
    />
  </>
);
const renderPaymentAndDoubleCTA = (
  messageId: UIMessageId,
  paymentData: PaymentData,
  canNavigateToPayment: boolean,
  isLoadingPayment: boolean,
  cta1: CTA,
  cta1IsPNOptInMessage: boolean,
  cta2: CTA,
  cta2IsPNOptInMessage: boolean,
  onCTAPress: (cta: CTA, isPNOptInMessage: boolean) => void
) => (
  <>
    {RenderPaymentButton(
      messageId,
      paymentData,
      canNavigateToPayment,
      isLoadingPayment
    )}
    <VSpacer size={8} />
    <ButtonOutline
      accessibilityLabel={cta1.text}
      fullWidth
      label={cta1.text}
      onPress={() => onCTAPress(cta1, cta1IsPNOptInMessage)}
    />
    <VSpacer size={8} />
    <ButtonLink
      accessibilityLabel={cta2.text}
      label={cta2.text}
      onPress={() => onCTAPress(cta2, cta2IsPNOptInMessage)}
    />
  </>
);
const renderSingleCTA = (
  cta: CTA,
  isPNOptInMessage: boolean,
  onCTAPress: (cta: CTA, isPNOptInMessage: boolean) => void
) => (
  <ButtonSolid
    accessibilityLabel={cta.text}
    fullWidth
    label={cta.text}
    onPress={() => onCTAPress(cta, isPNOptInMessage)}
  />
);

export const MessageDetailsStickyFooter = ({
  ctas,
  firstCTAIsPNOptInMessage,
  messageId,
  secondCTAIsPNOptInMessage,
  serviceId
}: MessageDetailsPaymentButtonProps) => {
  const safeAreaInsets = useSafeAreaInsets();
  const paymentData = useIOSelector(state =>
    messagePaymentDataSelector(state, messageId)
  );
  const paymentButtonStatus = useIOSelector(state =>
    paymentsButtonStateSelector(state, messageId)
  );
  const canNavigateToPayment = useIOSelector(state =>
    canNavigateToPaymentFromMessageSelector(state)
  );

  const linkTo = useLinkTo();
  const handleOnPress = React.useCallback(
    (cta: CTA, isPNOptInMessage: boolean) => {
      if (isPNOptInMessage) {
        trackPNOptInMessageAccepted();
      }
      handleCtaAction(cta, linkTo, serviceId);
    },
    [linkTo, serviceId]
  );

  const isPaymentButtonVisible =
    paymentData && paymentButtonStatus !== "hidden";
  if (!ctas && !isPaymentButtonVisible) {
    return null;
  }

  const isCTA1Visible = !!ctas?.cta_1;
  const cta2 = ctas?.cta_2;
  const isCTA2Visible = !!cta2;

  return (
    <View
      style={[
        IOStyles.footer,
        styles.container,
        { paddingBottom: safeAreaInsets.bottom + IOStyles.footer.paddingBottom }
      ]}
    >
      {isPaymentButtonVisible &&
        isCTA1Visible &&
        isCTA2Visible &&
        renderPaymentAndDoubleCTA(
          messageId,
          paymentData,
          canNavigateToPayment,
          paymentButtonStatus === "loading",
          ctas.cta_1,
          firstCTAIsPNOptInMessage,
          cta2,
          secondCTAIsPNOptInMessage,
          handleOnPress
        )}
      {isPaymentButtonVisible &&
        isCTA1Visible &&
        renderPaymentAndSingleCTA(
          messageId,
          paymentData,
          canNavigateToPayment,
          paymentButtonStatus === "loading",
          ctas.cta_1,
          firstCTAIsPNOptInMessage,
          handleOnPress
        )}
      {isCTA1Visible &&
        isCTA2Visible &&
        renderDoubleCTA(
          ctas.cta_1,
          firstCTAIsPNOptInMessage,
          cta2,
          secondCTAIsPNOptInMessage,
          handleOnPress
        )}
      {isCTA1Visible &&
        renderSingleCTA(ctas.cta_1, firstCTAIsPNOptInMessage, handleOnPress)}
      {isPaymentButtonVisible &&
        RenderPaymentButton(
          messageId,
          paymentData,
          canNavigateToPayment,
          paymentButtonStatus === "loading"
        )}
    </View>
  );
};

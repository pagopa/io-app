import * as React from "react";
import { StyleSheet, View } from "react-native";
import { useLinkTo } from "@react-navigation/native";
import {
  ButtonLink,
  ButtonOutline,
  ButtonSolid,
  IOStyles,
  VSpacer,
  buttonSolidHeight
} from "@pagopa/io-app-design-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PaymentData, UIMessageId } from "../../types";
import { messagePaymentDataSelector } from "../../store/reducers/detailsById";
import { useIOSelector } from "../../../../store/hooks";
import {
  canNavigateToPaymentFromMessageSelector,
  paymentsButtonStateSelector
} from "../../store/reducers/payments";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { trackPNOptInMessageAccepted } from "../../../pn/analytics";
import { handleCtaAction } from "../../utils/messages";
import { CTA, CTAS } from "../../types/MessageCTA";
import { MessageDetailsPaymentButton } from "./MessageDetailsPaymentButton";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    overflow: "hidden",
    bottom: 0,
    width: "100%"
  },
  buttonLinkInFooter: {
    height: buttonSolidHeight,
    justifyContent: "center",
    alignSelf: "center"
  }
});

type MessageDetailsPaymentButtonProps = {
  ctas?: CTAS;
  firstCTAIsPNOptInMessage: boolean;
  messageId: UIMessageId;
  secondCTAIsPNOptInMessage: boolean;
  serviceId: ServiceId;
};

type FooterPaymentWithDoubleCTA = {
  tag: "PaymentWithDoubleCTA";
  cta1: CTA;
  cta2: CTA;
  paymentData: PaymentData;
};

type FooterPaymentWithCTA = {
  tag: "PaymentWithCTA";
  cta1: CTA;
  paymentData: PaymentData;
};
type FooterDoubleCTA = {
  tag: "DoubleCTA";
  cta1: CTA;
  cta2: CTA;
};
type FooterPayment = {
  tag: "Payment";
  paymentData: PaymentData;
};
type FooterCTA = {
  tag: "CTA";
  cta1: CTA;
};
type FooterNone = {
  tag: "None";
};
type FooterData =
  | FooterPaymentWithDoubleCTA
  | FooterPaymentWithCTA
  | FooterDoubleCTA
  | FooterPayment
  | FooterCTA
  | FooterNone;

const isNone = (footerData: FooterData): footerData is FooterNone =>
  footerData.tag === "None";

const foldFooterData = (
  footerData: FooterData,
  onPaymentWithDoubleCTA: (
    paymentWithDoubleCTA: FooterPaymentWithDoubleCTA
  ) => JSX.Element,
  onPaymentWithCTA: (paymentWithCTA: FooterPaymentWithCTA) => JSX.Element,
  onDoubleCTA: (doubleCTA: FooterDoubleCTA) => JSX.Element,
  onPayment: (paymentCTA: FooterPayment) => JSX.Element,
  onCTA: (cta: FooterCTA) => JSX.Element,
  onNone: () => JSX.Element | null
) => {
  switch (footerData.tag) {
    case "PaymentWithDoubleCTA":
      return onPaymentWithDoubleCTA(footerData);
    case "PaymentWithCTA":
      return onPaymentWithCTA(footerData);
    case "DoubleCTA":
      return onDoubleCTA(footerData);
    case "Payment":
      return onPayment(footerData);
    case "CTA":
      return onCTA(footerData);
  }
  return onNone();
};

const computeFooterData = (
  paymentData: PaymentData | undefined,
  paymentButtonStatus: "hidden" | "loading" | "enabled",
  ctas: CTAS | undefined
): FooterData => {
  const isPaymentButtonVisible =
    paymentData && paymentButtonStatus !== "hidden";
  const isCTA1Visible = !!ctas?.cta_1;
  const cta2 = ctas?.cta_2;
  const isCTA2Visible = !!cta2;
  if (isPaymentButtonVisible && isCTA1Visible && isCTA2Visible) {
    return {
      tag: "PaymentWithDoubleCTA",
      cta1: ctas.cta_1,
      cta2,
      paymentData
    };
  } else if (isPaymentButtonVisible && isCTA1Visible) {
    return {
      tag: "PaymentWithCTA",
      cta1: ctas.cta_1,
      paymentData
    };
  } else if (isCTA1Visible && isCTA2Visible) {
    return {
      tag: "DoubleCTA",
      cta1: ctas.cta_1,
      cta2
    };
  } else if (isPaymentButtonVisible) {
    return {
      tag: "Payment",
      paymentData
    };
  } else if (isCTA1Visible) {
    return {
      tag: "CTA",
      cta1: ctas.cta_1
    };
  }
  return { tag: "None" };
};

const renderPaymentWithDoubleCTA = (
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
    <MessageDetailsPaymentButton
      messageId={messageId}
      paymentData={paymentData}
      canNavigateToPayment={canNavigateToPayment}
      isLoading={isLoadingPayment}
    />
    <VSpacer size={8} />
    <ButtonOutline
      accessibilityLabel={cta1.text}
      fullWidth
      label={cta1.text}
      onPress={() => onCTAPress(cta1, cta1IsPNOptInMessage)}
    />
    <VSpacer size={8} />
    <View style={styles.buttonLinkInFooter}>
      <ButtonLink
        accessibilityLabel={cta2.text}
        label={cta2.text}
        onPress={() => onCTAPress(cta2, cta2IsPNOptInMessage)}
      />
    </View>
  </>
);
const renderPaymentWithCTA = (
  messageId: UIMessageId,
  paymentData: PaymentData,
  canNavigateToPayment: boolean,
  isLoadingPayment: boolean,
  cta1: CTA,
  cta1IsPNOptInMessage: boolean,
  onCTAPress: (cta: CTA, isPNOptInMessage: boolean) => void
) => (
  <>
    <MessageDetailsPaymentButton
      messageId={messageId}
      paymentData={paymentData}
      canNavigateToPayment={canNavigateToPayment}
      isLoading={isLoadingPayment}
    />
    <VSpacer size={8} />
    <View style={styles.buttonLinkInFooter}>
      <ButtonLink
        accessibilityLabel={cta1.text}
        label={cta1.text}
        onPress={() => onCTAPress(cta1, cta1IsPNOptInMessage)}
      />
    </View>
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
    <View style={styles.buttonLinkInFooter}>
      <ButtonLink
        accessibilityLabel={cta2.text}
        label={cta2.text}
        onPress={() => onCTAPress(cta2, cta2IsPNOptInMessage)}
      />
    </View>
  </>
);
const renderPayment = (
  messageId: UIMessageId,
  paymentData: PaymentData,
  canNavigateToPayment: boolean,
  isLoadingPayment: boolean
) => (
  <MessageDetailsPaymentButton
    messageId={messageId}
    paymentData={paymentData}
    canNavigateToPayment={canNavigateToPayment}
    isLoading={isLoadingPayment}
  />
);
const renderCTA = (
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

  const footerData = computeFooterData(paymentData, paymentButtonStatus, ctas);
  if (isNone(footerData)) {
    return null;
  }

  const isPaymentLoading = paymentButtonStatus === "loading";
  return (
    <View
      style={[
        IOStyles.footer,
        styles.container,
        { paddingBottom: safeAreaInsets.bottom + IOStyles.footer.paddingBottom }
      ]}
    >
      {foldFooterData(
        footerData,
        paymentWithDoubleCTA =>
          renderPaymentWithDoubleCTA(
            messageId,
            paymentWithDoubleCTA.paymentData,
            canNavigateToPayment,
            isPaymentLoading,
            paymentWithDoubleCTA.cta1,
            firstCTAIsPNOptInMessage,
            paymentWithDoubleCTA.cta2,
            secondCTAIsPNOptInMessage,
            handleOnPress
          ),
        paymentWithCTA =>
          renderPaymentWithCTA(
            messageId,
            paymentWithCTA.paymentData,
            canNavigateToPayment,
            isPaymentLoading,
            paymentWithCTA.cta1,
            firstCTAIsPNOptInMessage,
            handleOnPress
          ),
        doubleCTA =>
          renderDoubleCTA(
            doubleCTA.cta1,
            firstCTAIsPNOptInMessage,
            doubleCTA.cta2,
            secondCTAIsPNOptInMessage,
            handleOnPress
          ),
        payment =>
          renderPayment(
            messageId,
            payment.paymentData,
            canNavigateToPayment,
            isPaymentLoading
          ),
        cta => renderCTA(cta.cta1, firstCTAIsPNOptInMessage, handleOnPress),
        () => null
      )}
    </View>
  );
};

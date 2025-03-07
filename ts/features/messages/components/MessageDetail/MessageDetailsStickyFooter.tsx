import { useCallback } from "react";
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
import { useIOSelector, useIOStore } from "../../../../store/hooks";
import {
  canNavigateToPaymentFromMessageSelector,
  paymentsButtonStateSelector
} from "../../store/reducers/payments";
import { trackPNOptInMessageAccepted } from "../../../pn/analytics";
import { handleCtaAction } from "../../utils/ctas";
import { CTA, CTAS } from "../../types/MessageCTA";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { useFIMSFromServiceId } from "../../../fims/common/hooks";
import { MessageDetailsPaymentButton } from "./MessageDetailsPaymentButton";
import { computeAndTrackCTAPressAnalytics } from "./detailsUtils";

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
  serviceId: ServiceId,
  paymentData: PaymentData,
  canNavigateToPayment: boolean,
  isLoadingPayment: boolean,
  cta1: CTA,
  cta1IsPNOptInMessage: boolean,
  cta2: CTA,
  cta2IsPNOptInMessage: boolean,
  onCTAPress: (isFirstCTA: boolean, cta: CTA, isPNOptInMessage: boolean) => void
) => (
  <>
    <MessageDetailsPaymentButton
      serviceId={serviceId}
      paymentData={paymentData}
      canNavigateToPayment={canNavigateToPayment}
      isLoading={isLoadingPayment}
    />
    <VSpacer size={8} />
    <ButtonOutline
      accessibilityLabel={cta1.text}
      fullWidth
      label={cta1.text}
      onPress={() => onCTAPress(true, cta1, cta1IsPNOptInMessage)}
    />
    <VSpacer size={8} />
    <View style={styles.buttonLinkInFooter}>
      <ButtonLink
        accessibilityLabel={cta2.text}
        label={cta2.text}
        onPress={() => onCTAPress(false, cta2, cta2IsPNOptInMessage)}
      />
    </View>
  </>
);
const renderPaymentWithCTA = (
  serviceId: ServiceId,
  paymentData: PaymentData,
  canNavigateToPayment: boolean,
  isLoadingPayment: boolean,
  cta1: CTA,
  cta1IsPNOptInMessage: boolean,
  onCTAPress: (isFirstCTA: boolean, cta: CTA, isPNOptInMessage: boolean) => void
) => (
  <>
    <MessageDetailsPaymentButton
      serviceId={serviceId}
      paymentData={paymentData}
      canNavigateToPayment={canNavigateToPayment}
      isLoading={isLoadingPayment}
    />
    <VSpacer size={8} />
    <View style={styles.buttonLinkInFooter}>
      <ButtonLink
        accessibilityLabel={cta1.text}
        label={cta1.text}
        onPress={() => onCTAPress(true, cta1, cta1IsPNOptInMessage)}
      />
    </View>
  </>
);
const renderDoubleCTA = (
  cta1: CTA,
  cta1IsPNOptInMessage: boolean,
  cta2: CTA,
  cta2IsPNOptInMessage: boolean,
  onCTAPress: (isFirstCTA: boolean, cta: CTA, isPNOptInMessage: boolean) => void
) => (
  <>
    <ButtonSolid
      accessibilityLabel={cta1.text}
      fullWidth
      label={cta1.text}
      onPress={() => onCTAPress(true, cta1, cta1IsPNOptInMessage)}
    />
    <VSpacer size={8} />
    <View style={styles.buttonLinkInFooter}>
      <ButtonLink
        accessibilityLabel={cta2.text}
        label={cta2.text}
        onPress={() => onCTAPress(false, cta2, cta2IsPNOptInMessage)}
      />
    </View>
  </>
);
const renderPayment = (
  serviceId: ServiceId,
  paymentData: PaymentData,
  canNavigateToPayment: boolean,
  isLoadingPayment: boolean
) => (
  <MessageDetailsPaymentButton
    serviceId={serviceId}
    paymentData={paymentData}
    canNavigateToPayment={canNavigateToPayment}
    isLoading={isLoadingPayment}
  />
);
const renderCTA = (
  cta: CTA,
  isPNOptInMessage: boolean,
  onCTAPress: (isFirstCTA: boolean, cta: CTA, isPNOptInMessage: boolean) => void
) => (
  <ButtonSolid
    accessibilityLabel={cta.text}
    fullWidth
    label={cta.text}
    onPress={() => onCTAPress(true, cta, isPNOptInMessage)}
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
  const store = useIOStore();
  const paymentData = useIOSelector(state =>
    messagePaymentDataSelector(state, messageId)
  );
  const paymentButtonStatus = useIOSelector(state =>
    paymentsButtonStateSelector(state, messageId)
  );
  const canNavigateToPayment = useIOSelector(state =>
    canNavigateToPaymentFromMessageSelector(state)
  );

  const { startFIMSAuthenticationFlow } = useFIMSFromServiceId(serviceId);
  const linkTo = useLinkTo();
  const onCTAPressedCallback = useCallback(
    (isFirstCTA: boolean, cta: CTA, isPNOptInMessage: boolean) => {
      const state = store.getState();
      computeAndTrackCTAPressAnalytics(isFirstCTA, cta, serviceId, state);
      if (isPNOptInMessage) {
        trackPNOptInMessageAccepted();
      }
      handleCtaAction(cta, linkTo, (label, url) =>
        startFIMSAuthenticationFlow(label, url)
      );
    },
    [linkTo, serviceId, startFIMSAuthenticationFlow, store]
  );

  const footerData = computeFooterData(paymentData, paymentButtonStatus, ctas);
  if (isNone(footerData)) {
    return null;
  }

  const paddingBottom =
    safeAreaInsets.bottom +
    (footerData.tag === "CTA" || footerData.tag === "Payment"
      ? IOStyles.footer.paddingBottom
      : 0);

  const isPaymentLoading = paymentButtonStatus === "loading";
  return (
    <View style={[IOStyles.footer, styles.container, { paddingBottom }]}>
      {foldFooterData(
        footerData,
        paymentWithDoubleCTA =>
          renderPaymentWithDoubleCTA(
            serviceId,
            paymentWithDoubleCTA.paymentData,
            canNavigateToPayment,
            isPaymentLoading,
            paymentWithDoubleCTA.cta1,
            firstCTAIsPNOptInMessage,
            paymentWithDoubleCTA.cta2,
            secondCTAIsPNOptInMessage,
            onCTAPressedCallback
          ),
        paymentWithCTA =>
          renderPaymentWithCTA(
            serviceId,
            paymentWithCTA.paymentData,
            canNavigateToPayment,
            isPaymentLoading,
            paymentWithCTA.cta1,
            firstCTAIsPNOptInMessage,
            onCTAPressedCallback
          ),
        doubleCTA =>
          renderDoubleCTA(
            doubleCTA.cta1,
            firstCTAIsPNOptInMessage,
            doubleCTA.cta2,
            secondCTAIsPNOptInMessage,
            onCTAPressedCallback
          ),
        payment =>
          renderPayment(
            serviceId,
            payment.paymentData,
            canNavigateToPayment,
            isPaymentLoading
          ),
        cta =>
          renderCTA(cta.cta1, firstCTAIsPNOptInMessage, onCTAPressedCallback),
        () => null
      )}
    </View>
  );
};

import { JSX, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { useLinkTo } from "@react-navigation/native";
import {
  IOButton,
  VSpacer,
  buttonSolidHeight,
  FooterActions,
  useIOToast
} from "@pagopa/io-app-design-system";
import { PaymentData, UIMessageId } from "../../types";
import { messagePaymentDataSelector } from "../../store/reducers/detailsById";
import {
  useIOSelector,
  useIOStore,
  useIODispatch
} from "../../../../store/hooks";
import {
  canNavigateToPaymentFromMessageSelector,
  paymentsButtonStateSelector
} from "../../store/reducers/payments";
import { trackPNOptInMessageAccepted } from "../../../pn/analytics";
import { handleCtaAction } from "../../utils/ctas";
import { CTA, CTAS } from "../../../../types/LocalizedCTAs";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { useFIMSFromServiceId } from "../../../fims/common/hooks";
import I18n from "../../../../i18n";
import {
  getRptIdStringFromPaymentData,
  initializeAndNavigateToWalletForPayment
} from "../../utils";
import {
  computeAndTrackCTAPressAnalytics,
  computeAndTrackPaymentStart
} from "./detailsUtils";

type DSFooterActionsType =
  | {
      type: "SingleButton";
      primary: { label: string; onPress: () => void; disabled?: boolean };
    }
  | {
      type: "TwoButtons";
      primary: { label: string; onPress: () => void; disabled?: boolean };
      secondary: { label: string; onPress: () => void };
    }
  | {
      type: "ThreeButtons";
      primary: { label: string; onPress: () => void; disabled?: boolean };
      secondary: { label: string; onPress: () => void };
      tertiary: { label: string; onPress: () => void };
    };

const styles = StyleSheet.create({
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
    <IOButton
      variant="outline"
      label={cta1.text}
      onPress={() => onCTAPress(true, cta1, cta1IsPNOptInMessage)}
    />
    <VSpacer size={8} />
    <View style={styles.buttonLinkInFooter}>
      <IOButton
        variant="link"
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
    <IOButton
      variant="outline"
      label={cta1.text}
      onPress={() => onCTAPress(true, cta1, cta1IsPNOptInMessage)}
    />
    <VSpacer size={8} />
    <View style={styles.buttonLinkInFooter}>
      <IOButton
        variant="link"
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
    <IOButton
      fullWidth
      variant="solid"
      label={cta1.text}
      onPress={() => onCTAPress(true, cta1, cta1IsPNOptInMessage)}
    />
    <VSpacer size={8} />
    <View style={styles.buttonLinkInFooter}>
      <IOButton
        variant="link"
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
  <IOButton
    variant="outline"
    label={I18n.t("features.messages.payments.pay")}
    onPress={() =>
      initializeAndNavigateToWalletForPayment(
        getRptIdStringFromPaymentData(paymentData),
        true,
        canNavigateToPayment,
        useIODispatch(),
        undefined, // analyticsCallback not used here
        () => useIOToast().error(I18n.t("genericError"))
      )
    }
    disabled={!canNavigateToPayment}
  />
);
const renderCTA = (
  cta: CTA,
  isPNOptInMessage: boolean,
  onCTAPress: (isFirstCTA: boolean, cta: CTA, isPNOptInMessage: boolean) => void
) => (
  <IOButton
    fullWidth
    variant="solid"
    label={cta.text}
    onPress={() => onCTAPress(true, cta, isPNOptInMessage)}
  />
);

const mapFooterDataToActions = (
  footerData: FooterData,
  onCTAPress: (
    isFirstCTA: boolean,
    cta: CTA,
    isPNOptInMessage: boolean
  ) => void,
  firstCTAIsPNOptInMessage: boolean,
  secondCTAIsPNOptInMessage: boolean,
  canNavigateToPayment: boolean,
  isLoadingPayment: boolean,
  serviceId: ServiceId,
  paymentData: PaymentData | undefined,
  handlePaymentPress: () => void
): DSFooterActionsType | undefined => {
  switch (footerData.tag) {
    case "PaymentWithDoubleCTA":
      return {
        type: "ThreeButtons",
        primary: {
          label: I18n.t("features.messages.payments.pay"),
          onPress: handlePaymentPress,
          disabled: !canNavigateToPayment
        },
        secondary: {
          label: footerData.cta1.text,
          onPress: () =>
            onCTAPress(true, footerData.cta1, firstCTAIsPNOptInMessage)
        },
        tertiary: {
          label: footerData.cta2.text,
          onPress: () =>
            onCTAPress(false, footerData.cta2, secondCTAIsPNOptInMessage)
        }
      };
    case "PaymentWithCTA":
      return {
        type: "TwoButtons",
        primary: {
          label: I18n.t("features.messages.payments.pay"),
          onPress: handlePaymentPress,
          disabled: !canNavigateToPayment
        },
        secondary: {
          label: footerData.cta1.text,
          onPress: () =>
            onCTAPress(true, footerData.cta1, firstCTAIsPNOptInMessage)
        }
      };
    case "DoubleCTA":
      return {
        type: "TwoButtons",
        primary: {
          label: footerData.cta1.text,
          onPress: () =>
            onCTAPress(true, footerData.cta1, firstCTAIsPNOptInMessage)
        },
        secondary: {
          label: footerData.cta2.text,
          onPress: () =>
            onCTAPress(false, footerData.cta2, secondCTAIsPNOptInMessage)
        }
      };
    case "Payment":
      return {
        type: "SingleButton",
        primary: {
          label: I18n.t("features.messages.payments.pay"),
          onPress: handlePaymentPress,
          disabled: !canNavigateToPayment
        }
      };
    case "CTA":
      return {
        type: "SingleButton",
        primary: {
          label: footerData.cta1.text,
          onPress: () =>
            onCTAPress(true, footerData.cta1, firstCTAIsPNOptInMessage)
        }
      };
    case "None":
      return undefined;
  }
};

export const MessageDetailsStickyFooter = ({
  ctas,
  firstCTAIsPNOptInMessage,
  messageId,
  secondCTAIsPNOptInMessage,
  serviceId
}: MessageDetailsPaymentButtonProps) => {
  const store = useIOStore();
  const dispatch = useIODispatch();
  const toast = useIOToast();

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

  // Payment button logic as a callback
  const handlePaymentPress = useCallback(() => {
    if (!paymentData) {
      return;
    }
    initializeAndNavigateToWalletForPayment(
      getRptIdStringFromPaymentData(paymentData),
      true,
      canNavigateToPayment,
      dispatch,
      () => computeAndTrackPaymentStart(serviceId, store.getState()),
      () => toast.error(I18n.t("genericError"))
    );
  }, [paymentData, canNavigateToPayment, dispatch, serviceId, store, toast]);

  const footerData = computeFooterData(paymentData, paymentButtonStatus, ctas);
  if (isNone(footerData)) {
    return null;
  }

  const isPaymentLoading = paymentButtonStatus === "loading";

  const actions = mapFooterDataToActions(
    footerData,
    onCTAPressedCallback,
    firstCTAIsPNOptInMessage,
    secondCTAIsPNOptInMessage,
    canNavigateToPayment,
    isPaymentLoading,
    serviceId,
    paymentData,
    handlePaymentPress
  );

  return actions && <FooterActions actions={actions} />;
};

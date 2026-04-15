import { FooterActions, useIOToast } from "@pagopa/io-app-design-system";
import { useLinkTo } from "@react-navigation/native";
import { ComponentProps, useCallback } from "react";
import I18n from "i18next";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import { CTA, CTAS } from "../../../../types/LocalizedCTAs";
import { useFIMSFromServiceId } from "../../../fims/common/hooks";
import { trackPNOptInMessageAccepted } from "../../../pn/analytics";
import { messagePaymentDataSelector } from "../../store/reducers/detailsById";
import {
  canNavigateToPaymentFromMessageSelector,
  paymentsButtonStateSelector
} from "../../store/reducers/payments";
import { PaymentData } from "../../types";
import {
  getRptIdStringFromPaymentData,
  initializeAndNavigateToWalletForPayment
} from "../../utils";
import { handleCtaAction } from "../../utils/ctas";
import {
  computeAndTrackCTAPressAnalytics,
  computeAndTrackPaymentStart
} from "./detailsUtils";

type MessageDetailsPaymentButtonProps = {
  ctas?: CTAS;
  firstCTAIsPNOptInMessage: boolean;
  messageId: string;
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
  handlePaymentPress: () => void
): ComponentProps<typeof FooterActions>["actions"] | undefined => {
  const paymentButtonConfig = {
    label: I18n.t("features.messages.payments.pay"),
    onPress: handlePaymentPress,
    disabled: !canNavigateToPayment,
    loading: isLoadingPayment
  };

  switch (footerData.tag) {
    case "PaymentWithDoubleCTA":
      return {
        type: "ThreeButtons",
        primary: paymentButtonConfig,
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
        primary: paymentButtonConfig,
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
        primary: paymentButtonConfig
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
    handlePaymentPress
  );

  return actions && <FooterActions actions={actions} />;
};

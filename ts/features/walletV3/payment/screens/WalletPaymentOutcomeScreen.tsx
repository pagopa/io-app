import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { WalletPaymentFeebackBanner } from "../components/WalletPaymentFeedbackBanner";
import { usePaymentFailureSupportModal } from "../hooks/usePaymentFailureSupportModal";
import { WalletPaymentParamsList } from "../navigation/params";
import {
  walletPaymentDetailsSelector,
  walletPaymentStartRouteSelector
} from "../store/selectors";
import {
  WalletPaymentOutcome,
  WalletPaymentOutcomeEnum
} from "../types/PaymentOutcomeEnum";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";

type WalletPaymentOutcomeScreenNavigationParams = {
  outcome: WalletPaymentOutcome;
};

type WalletPaymentOutcomeRouteProps = RouteProp<
  WalletPaymentParamsList,
  "WALLET_PAYMENT_OUTCOME"
>;

const WalletPaymentOutcomeScreen = () => {
  useAvoidHardwareBackButton();

  const { params } = useRoute<WalletPaymentOutcomeRouteProps>();
  const { outcome } = params;

  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const paymentDetailsPot = useIOSelector(walletPaymentDetailsSelector);
  const paymentStartRoute = useIOSelector(walletPaymentStartRouteSelector);

  const supportModal = usePaymentFailureSupportModal({
    outcome
  });

  // TODO: This is a workaround to disable swipe back gesture on this screen
  // .. it should be removed as soon as the migration to react-navigation v6 is completed (https://pagopa.atlassian.net/browse/IOBP-522)
  React.useEffect(() => {
    // Disable swipe
    navigation.setOptions({ gestureEnabled: false });
    navigation.getParent()?.setOptions({ gestureEnabled: false });
    // Re-enable swipe after going back
    return () => {
      navigation.getParent()?.setOptions({ gestureEnabled: true });
    };
  }, [navigation]);

  const paymentAmount = pipe(
    paymentDetailsPot,
    pot.toOption,
    O.map(({ amount }) => formatNumberCentsToAmount(amount, true, "right")),
    O.getOrElse(() => "-")
  );

  const handleContactSupport = () => {
    supportModal.present();
  };

  const handleClose = () => {
    if (paymentStartRoute) {
      navigation.navigate(paymentStartRoute.routeName, {
        screen: paymentStartRoute.routeKey
      });
      return;
    }
    navigation.popToTop();
    navigation.pop();
  };

  const closeSuccessAction: OperationResultScreenContentProps["action"] = {
    label: I18n.t("wallet.payment.outcome.SUCCESS.button"),
    accessibilityLabel: I18n.t("wallet.payment.outcome.SUCCESS.button"),
    onPress: handleClose
  };

  const closeFailureAction: OperationResultScreenContentProps["action"] = {
    label: I18n.t("global.buttons.close"),
    accessibilityLabel: I18n.t("global.buttons.close"),
    onPress: handleClose
  };

  const contactSupportAction: OperationResultScreenContentProps["action"] = {
    label: I18n.t("wallet.payment.support.button"),
    accessibilityLabel: I18n.t("wallet.payment.support.button"),
    onPress: handleContactSupport
  };

  const getPropsForOutcome = (): OperationResultScreenContentProps => {
    switch (outcome) {
      case WalletPaymentOutcomeEnum.SUCCESS:
        return {
          pictogram: "success",
          title: I18n.t("wallet.payment.outcome.SUCCESS.title", {
            amount: paymentAmount
          }),
          action: closeSuccessAction
        };
      case WalletPaymentOutcomeEnum.GENERIC_ERROR:
      default:
        return {
          pictogram: "umbrellaNew",
          title: I18n.t("wallet.payment.outcome.GENERIC_ERROR.title"),
          subtitle: I18n.t("wallet.payment.outcome.GENERIC_ERROR.subtitle"),
          action: closeFailureAction
        };
      case WalletPaymentOutcomeEnum.AUTH_ERROR:
        return {
          pictogram: "accessDenied",
          title: I18n.t("wallet.payment.outcome.AUTH_ERROR.title"),
          subtitle: I18n.t("wallet.payment.outcome.AUTH_ERROR.subtitle"),
          action: closeFailureAction
        };
      case WalletPaymentOutcomeEnum.INVALID_DATA:
        return {
          pictogram: "cardIssue",
          title: I18n.t("wallet.payment.outcome.INVALID_DATA.title"),
          subtitle: I18n.t("wallet.payment.outcome.INVALID_DATA.subtitle"),
          action: closeFailureAction
        };
      case WalletPaymentOutcomeEnum.TIMEOUT:
        return {
          pictogram: "time",
          title: I18n.t("wallet.payment.outcome.TIMEOUT.title"),
          subtitle: I18n.t("wallet.payment.outcome.TIMEOUT.subtitle"),
          action: closeFailureAction
        };
      case WalletPaymentOutcomeEnum.CIRCUIT_ERROR:
        return {
          pictogram: "cardIssue",
          title: I18n.t("wallet.payment.outcome.CIRCUIT_ERROR.title"),
          action: contactSupportAction,
          secondaryAction: closeFailureAction
        };
      case WalletPaymentOutcomeEnum.MISSING_FIELDS:
        return {
          pictogram: "attention",
          title: I18n.t("wallet.payment.outcome.MISSING_FIELDS.title"),
          action: contactSupportAction,
          secondaryAction: closeFailureAction
        };
      case WalletPaymentOutcomeEnum.INVALID_CARD:
        return {
          pictogram: "cardIssue",
          title: I18n.t("wallet.payment.outcome.INVALID_CARD.title"),
          subtitle: I18n.t("wallet.payment.outcome.INVALID_CARD.subtitle"),
          action: closeFailureAction
        };
      case WalletPaymentOutcomeEnum.CANCELED_BY_USER:
        return {
          pictogram: "trash",
          title: I18n.t("wallet.payment.outcome.CANCELED_BY_USER.title"),
          subtitle: I18n.t("wallet.payment.outcome.CANCELED_BY_USER.subtitle"),
          action: closeFailureAction
        };
      case WalletPaymentOutcomeEnum.EXCESSIVE_AMOUNT:
        return {
          pictogram: "accessDenied",
          title: I18n.t("wallet.payment.outcome.EXCESSIVE_AMOUNT.title"),
          subtitle: I18n.t("wallet.payment.outcome.EXCESSIVE_AMOUNT.subtitle"),
          action: closeFailureAction
        };
      case WalletPaymentOutcomeEnum.INVALID_METHOD:
        return {
          pictogram: "cardIssue",
          title: I18n.t("wallet.payment.outcome.INVALID_METHOD.title"),
          action: contactSupportAction,
          secondaryAction: closeFailureAction
        };
    }
  };

  const requiresFeedback = outcome === WalletPaymentOutcomeEnum.SUCCESS;

  return (
    <>
      <OperationResultScreenContent {...getPropsForOutcome()}>
        {requiresFeedback && <WalletPaymentFeebackBanner />}
      </OperationResultScreenContent>
      {supportModal.bottomSheet}
    </>
  );
};

export { WalletPaymentOutcomeScreen };
export type { WalletPaymentOutcomeScreenNavigationParams };

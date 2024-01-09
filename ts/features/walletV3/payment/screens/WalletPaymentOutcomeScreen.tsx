import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { default as React } from "react";
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
import { WalletPaymentParamsList } from "../navigation/params";
import { walletPaymentDetailsSelector } from "../store/selectors";
import {
  WalletPaymentOutcome,
  WalletPaymentOutcomeEnum
} from "../types/PaymentOutcomeEnum";

type WalletPaymentOutcomeScreenNavigationParams = {
  outcome: WalletPaymentOutcome;
};

type WalletPaymentOutcomeRouteProps = RouteProp<
  WalletPaymentParamsList,
  "WALLET_PAYMENT_OUTCOME"
>;

const WalletPaymentOutcomeScreen = () => {
  const {
    params: { outcome }
  } = useRoute<WalletPaymentOutcomeRouteProps>();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const paymentDetailsPot = useIOSelector(walletPaymentDetailsSelector);

  const paymentAmount = pipe(
    paymentDetailsPot,
    pot.toOption,
    O.map(({ amount }) => formatNumberCentsToAmount(amount, true, "right")),
    O.getOrElse(() => "-")
  );

  const handleClose = () => {
    navigation.popToTop();
    navigation.pop();
  };

  const closeAction: OperationResultScreenContentProps["action"] = {
    label: I18n.t("wallet.payment.outcome.success.button"),
    accessibilityLabel: I18n.t("wallet.payment.outcome.success.button"),
    onPress: handleClose
  };

  const closeFailureAction: OperationResultScreenContentProps["action"] = {
    label: I18n.t("wallet.payment.outcome.success.button"),
    accessibilityLabel: I18n.t("wallet.payment.outcome.success.button"),
    onPress: handleClose
  };

  const contactSupportAction: OperationResultScreenContentProps["action"] = {
    label: I18n.t("wallet.payment.outcome.success.button"),
    accessibilityLabel: I18n.t("wallet.payment.outcome.success.button"),
    onPress: handleClose
  };

  const getPropsForOutcome = (): OperationResultScreenContentProps => {
    switch (outcome) {
      case WalletPaymentOutcomeEnum.SUCCESS:
        return {
          pictogram: "success",
          title: I18n.t("wallet.payment.outcome.success.title", {
            amount: paymentAmount
          }),
          action: closeAction
        };
      default:
        return {
          pictogram: "umbrellaNew",
          title: "ciao",
          subtitle: "ciao",
          action: contactSupportAction,
          secondaryAction: closeFailureAction
        };
    }
  };

  const requiresFeedback = outcome === WalletPaymentOutcomeEnum.SUCCESS;

  return (
    <OperationResultScreenContent {...getPropsForOutcome()}>
      {requiresFeedback && <WalletPaymentFeebackBanner />}
    </OperationResultScreenContent>
  );
};

export { WalletPaymentOutcomeScreen };
export type { WalletPaymentOutcomeScreenNavigationParams };

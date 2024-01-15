import { useNavigation } from "@react-navigation/native";
import React from "react";
import { FaultCategoryEnum } from "../../../../../definitions/pagopa/ecommerce/FaultCategory";
import { ValidationFaultEnum } from "../../../../../definitions/pagopa/ecommerce/ValidationFault";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { usePaymentFailureSupportModal } from "../hooks/usePaymentFailureSupportModal";
import { WalletPaymentFailure } from "../types/failure";

type Props = {
  failure: WalletPaymentFailure;
};

const WalletPaymentFailureDetail = ({ failure }: Props) => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const supportModal = usePaymentFailureSupportModal({ failure });

  const handleClose = () => {
    navigation.pop();
  };

  const handleContactSupport = () => {
    supportModal.present();
  };

  const closeAction: OperationResultScreenContentProps["action"] = {
    label: I18n.t("global.buttons.close"),
    accessibilityLabel: I18n.t("global.buttons.close"),
    onPress: handleClose
  };

  const contactSupportAction: OperationResultScreenContentProps["action"] = {
    label: I18n.t("wallet.payment.support.button"),
    accessibilityLabel: I18n.t("wallet.payment.support.button"),
    onPress: handleContactSupport
  };

  const genericErrorProps: OperationResultScreenContentProps = {
    pictogram: "umbrellaNew",
    title: I18n.t("wallet.payment.failure.GENERIC_ERROR.title"),
    subtitle: I18n.t("wallet.payment.failure.GENERIC_ERROR.subtitle"),
    action: closeAction
  };

  const getPropsFromFailure = ({
    faultCodeCategory,
    faultCodeDetail
  }: WalletPaymentFailure): OperationResultScreenContentProps => {
    switch (faultCodeCategory) {
      case FaultCategoryEnum.PAYMENT_UNAVAILABLE:
        return {
          pictogram: "fatalError",
          title: I18n.t("wallet.payment.failure.PAYMENT_UNAVAILABLE.title"),
          action: contactSupportAction,
          secondaryAction: closeAction
        };
      case FaultCategoryEnum.PAYMENT_UNKNOWN:
        return {
          pictogram: "attention",
          title: I18n.t("wallet.payment.failure.PAYMENT_UNKNOWN.title"),
          action: closeAction,
          secondaryAction: contactSupportAction
        };
      case FaultCategoryEnum.DOMAIN_UNKNOWN:
        return {
          pictogram: "comunicationProblem",
          title: I18n.t("wallet.payment.failure.DOMAIN_UNKNOWN.title"),
          subtitle: I18n.t("wallet.payment.failure.DOMAIN_UNKNOWN.subtitle"),
          action: closeAction,
          secondaryAction: contactSupportAction
        };
      case FaultCategoryEnum.PAYMENT_ONGOING:
        return {
          pictogram: "timing",
          title: I18n.t("wallet.payment.failure.PAYMENT_ONGOING.title"),
          subtitle: I18n.t("wallet.payment.failure.PAYMENT_ONGOING.subtitle"),
          action: closeAction,
          secondaryAction: contactSupportAction
        };
      case FaultCategoryEnum.PAYMENT_EXPIRED:
        return {
          pictogram: "time",
          title: I18n.t("wallet.payment.failure.PAYMENT_EXPIRED.title"),
          subtitle: I18n.t("wallet.payment.failure.PAYMENT_EXPIRED.subtitle"),
          action: closeAction
        };
      case FaultCategoryEnum.PAYMENT_CANCELED:
        return {
          pictogram: "stopSecurity",
          title: I18n.t("wallet.payment.failure.PAYMENT_CANCELED.title"),
          subtitle: I18n.t("wallet.payment.failure.PAYMENT_CANCELED.subtitle"),
          action: closeAction,
          secondaryAction: contactSupportAction
        };
      case FaultCategoryEnum.PAYMENT_DUPLICATED:
        return {
          pictogram: "moneyCheck",
          title: I18n.t("wallet.payment.failure.PAYMENT_DUPLICATED.title"),
          action: closeAction
        };
      case FaultCategoryEnum.GENERIC_ERROR:
        if (faultCodeDetail === ValidationFaultEnum.PAA_PAGAMENTO_SCONOSCIUTO) {
          return {
            pictogram: "searchLens",
            title: I18n.t(
              "wallet.payment.failure.PAA_PAGAMENTO_SCONOSCIUTO.title"
            ),
            subtitle: I18n.t(
              "wallet.payment.failure.PAA_PAGAMENTO_SCONOSCIUTO.subtitle"
            ),
            action: closeAction
          };
        }
        return genericErrorProps;
      default:
        return genericErrorProps;
    }
  };

  const contentProps = getPropsFromFailure(failure);

  return (
    <>
      <OperationResultScreenContent {...contentProps} />
      {supportModal.bottomSheet}
    </>
  );
};

export { WalletPaymentFailureDetail };

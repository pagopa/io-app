import {
  Body,
  GradientScrollView,
  LabelLink,
  ListItemHeader,
  ModuleCheckout,
  VSpacer
} from "@pagopa/io-app-design-system";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Bundle } from "../../../../../definitions/pagopa/ecommerce/Bundle";
import { PaymentRequestsGetResponse } from "../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { format } from "../../../../utils/dates";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { capitalize } from "../../../../utils/strings";
import {
  WALLET_PAYMENT_TERMS_AND_CONDITIONS_URL,
  getPaymentLogo
} from "../../common/utils";
import { UIWalletInfoDetails } from "../../details/types/UIWalletInfoDetails";
import { WalletPaymentRoutes } from "../navigation/routes";
import { WalletPaymentTotalAmount } from "./WalletPaymentTotalAmount";

export type WalletPaymentConfirmContentProps = {
  paymentMethodDetails: UIWalletInfoDetails;
  selectedPsp: Bundle;
  paymentDetails: PaymentRequestsGetResponse;
  isLoading?: boolean;
  onConfirm?: () => void;
};

export const WalletPaymentConfirmContent = ({
  paymentMethodDetails,
  selectedPsp,
  paymentDetails,
  isLoading,
  onConfirm
}: WalletPaymentConfirmContentProps) => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const taxFee = selectedPsp.taxPayerFee ?? 0;

  const paymentAmount = paymentDetails.amount ?? 0;

  const totalAmount = +paymentAmount + taxFee;

  return (
    <GradientScrollView
      primaryActionProps={{
        label: `${I18n.t("payment.confirm.pay")} ${formatNumberCentsToAmount(
          totalAmount,
          true,
          "right"
        )}`,
        accessibilityLabel: `${I18n.t(
          "payment.confirm.pay"
        )} ${formatNumberCentsToAmount(totalAmount, true, "right")}`,
        onPress: () => onConfirm?.(),
        disabled: isLoading,
        loading: isLoading
      }}
    >
      <ListItemHeader
        label={I18n.t("payment.confirm.payWith")}
        accessibilityLabel={I18n.t("payment.confirm.payWith")}
        iconName="creditCard"
      />
      <ModuleCheckout
        ctaText={I18n.t("payment.confirm.editButton")}
        paymentLogo={getPaymentLogo(paymentMethodDetails)}
        title={getPaymentTitle(paymentMethodDetails)}
        onPress={() =>
          navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
            screen: WalletPaymentRoutes.WALLET_PAYMENT_PICK_METHOD
          })
        }
      />
      <VSpacer size={24} />
      <ListItemHeader
        label={I18n.t("payment.confirm.fee")}
        accessibilityLabel={I18n.t("payment.confirm.fee")}
        iconName="psp"
      />
      <ModuleCheckout
        ctaText={I18n.t("payment.confirm.editButton")}
        title={formatNumberCentsToAmount(taxFee, true, "right")}
        subtitle={`${I18n.t("payment.confirm.feeAppliedBy")} ${
          selectedPsp.bundleName
        }`}
        onPress={() =>
          navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
            screen: WalletPaymentRoutes.WALLET_PAYMENT_PICK_PSP
          })
        }
      />
      <VSpacer size={24} />
      <WalletPaymentTotalAmount totalAmount={totalAmount} />
      <VSpacer size={16} />
      <Body>
        {I18n.t("payment.confirm.termsAndConditions")}{" "}
        <LabelLink
          onPress={() =>
            openAuthenticationSession(
              WALLET_PAYMENT_TERMS_AND_CONDITIONS_URL,
              "https"
            )
          }
        >
          {I18n.t("payment.confirm.termsAndConditionsLink")}
        </LabelLink>
      </Body>
    </GradientScrollView>
  );
};

const getPaymentSubtitle = (details: UIWalletInfoDetails): string => {
  if (details.maskedPan !== undefined) {
    return `${format(details.expiryDate, "MM/YY")}`;
  } else if (details.maskedEmail !== undefined) {
    return I18n.t("wallet.onboarding.paypal.name");
  } else if (details.maskedNumber !== undefined) {
    return `${details.bankName}`;
  }

  return "";
};

const getPaymentTitle = (details: UIWalletInfoDetails): string => {
  if (details.maskedPan !== undefined) {
    return `${capitalize(details.brand || "")} ••${details.maskedPan}`;
  } else if (details.maskedEmail !== undefined) {
    return `${details.maskedEmail}`;
  } else if (details.maskedNumber !== undefined) {
    return `${details.maskedNumber}`;
  }

  return "";
};

import React from "react";
import {
  Body,
  GradientScrollView,
  LabelLink,
  ListItemHeader,
  ModuleCheckout,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { WalletPaymentRoutes } from "../navigation/routes";
import {
  WALLET_PAYMENT_TERMS_AND_CONDITIONS_URL,
  getPaymentLogo
} from "../../common/utils";
import { format } from "../../../../utils/dates";
import { capitalize } from "../../../../utils/strings";
import { PaymentRequestsGetResponse } from "../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { Bundle } from "../../../../../definitions/pagopa/ecommerce/Bundle";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import {
  TypeEnum,
  WalletInfoDetails,
  WalletInfoDetails1,
  WalletInfoDetails2,
  WalletInfoDetails3
} from "../../../../../definitions/pagopa/walletv3/WalletInfoDetails";
import I18n from "../../../../i18n";

import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { WalletPaymentTotalAmount } from "./WalletPaymentTotalAmount";

export type WalletPaymentConfirmContentProps = {
  paymentMethodDetails: WalletInfoDetails;
  selectedMethod: WalletInfo;
  selectedPsp: Bundle;
  paymentDetails: PaymentRequestsGetResponse;
  isLoading?: boolean;
  onConfirm?: () => void;
};

export const WalletPaymentConfirmContent = ({
  paymentMethodDetails,
  selectedPsp,
  selectedMethod,
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
        subtitle={getPaymentSubtitle(paymentMethodDetails)}
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
            screen: WalletPaymentRoutes.WALLET_PAYMENT_PICK_PSP,
            params: {
              walletId: selectedMethod.walletId,
              paymentAmountInCents: paymentAmount
            }
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

const getPaymentSubtitle = (cardDetails: WalletInfoDetails) => {
  switch (cardDetails.type) {
    case TypeEnum.CARDS:
      const cardsDetail = cardDetails as WalletInfoDetails1;
      return `${cardsDetail.holder} · ${format(
        cardsDetail.expiryDate,
        "MM/YY"
      )}`;
    case TypeEnum.PAYPAL:
      return I18n.t("wallet.onboarding.paypal.name");
    case TypeEnum.BANCOMATPAY:
      const bancomatpayDetail = cardDetails as WalletInfoDetails3;
      return `${bancomatpayDetail.bankName}`;
    default:
      return "";
  }
};

const getPaymentTitle = (cardDetails: WalletInfoDetails) => {
  switch (cardDetails.type) {
    case TypeEnum.CARDS:
      const cardsDetail = cardDetails as WalletInfoDetails1;
      return `${capitalize(cardsDetail.brand)} ••${cardsDetail.maskedPan}`;
    case TypeEnum.PAYPAL:
      const paypalDetail = cardDetails as WalletInfoDetails2;
      return `${paypalDetail.maskedEmail}`;
    case TypeEnum.BANCOMATPAY:
      const bancomatpayDetail = cardDetails as WalletInfoDetails3;
      return `${bancomatpayDetail.maskedNumber}`;
    default:
      return "";
  }
};

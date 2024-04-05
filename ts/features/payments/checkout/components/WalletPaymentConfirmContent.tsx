import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  Body,
  GradientScrollView,
  LabelLink,
  ListItemHeader,
  ModuleCheckout,
  VSpacer
} from "@pagopa/io-app-design-system";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import React from "react";
import { Bundle } from "../../../../../definitions/pagopa/ecommerce/Bundle";
import { PaymentRequestsGetResponse } from "../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { capitalize } from "../../../../utils/strings";
import {
  WALLET_PAYMENT_TERMS_AND_CONDITIONS_URL,
  getPaymentLogo
} from "../../common/utils";
import { WalletPaymentStepEnum } from "../types";
import { UIWalletInfoDetails } from "../../common/types/UIWalletInfoDetails";
import { walletPaymentSetCurrentStep } from "../store/actions/orchestration";
import { walletPaymentPspListSelector } from "../store/selectors";
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
  const dispatch = useIODispatch();

  const pspListPot = useIOSelector(walletPaymentPspListSelector);

  const pspList = pot.getOrElse(pspListPot, []);

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
          dispatch(
            walletPaymentSetCurrentStep(
              WalletPaymentStepEnum.PICK_PAYMENT_METHOD
            )
          )
        }
      />
      <VSpacer size={24} />
      <ListItemHeader
        label={I18n.t("payment.confirm.fee")}
        accessibilityLabel={I18n.t("payment.confirm.fee")}
        iconName="psp"
      />
      <ModuleCheckout
        ctaText={
          pspList.length > 1 ? I18n.t("payment.confirm.editButton") : undefined
        }
        title={formatNumberCentsToAmount(taxFee, true, "right")}
        subtitle={`${I18n.t("payment.confirm.feeAppliedBy")} ${
          selectedPsp.bundleName
        }`}
        onPress={() =>
          dispatch(walletPaymentSetCurrentStep(WalletPaymentStepEnum.PICK_PSP))
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

const getPaymentSubtitle = (
  details: UIWalletInfoDetails
): string | undefined => {
  if (details.maskedEmail !== undefined) {
    return I18n.t("wallet.onboarding.paypal.name");
  } else if (details.maskedNumber !== undefined) {
    return `${details.bankName}`;
  }
  return undefined;
};

const getPaymentTitle = (details: UIWalletInfoDetails): string => {
  if (details.lastFourDigits !== undefined) {
    return `${capitalize(details.brand || "")} ••${details.lastFourDigits}`;
  } else if (details.maskedEmail !== undefined) {
    return `${details.maskedEmail}`;
  } else if (details.maskedNumber !== undefined) {
    return `${details.maskedNumber}`;
  }

  return "";
};

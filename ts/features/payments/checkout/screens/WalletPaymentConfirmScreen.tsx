import {
  Body,
  GradientScrollView,
  LabelLink,
  ListItemHeader,
  ModuleCheckout,
  VSpacer
} from "@pagopa/io-app-design-system";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { default as React } from "react";
import { AmountEuroCents } from "../../../../../definitions/pagopa/ecommerce/AmountEuroCents";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { capitalize } from "../../../../utils/strings";
import { UIWalletInfoDetails } from "../../common/types/UIWalletInfoDetails";
import {
  WALLET_PAYMENT_TERMS_AND_CONDITIONS_URL,
  getPaymentLogo
} from "../../common/utils";
import { WalletPaymentTotalAmount } from "../components/WalletPaymentTotalAmount";
import { useWalletPaymentAuthorizationModal } from "../hooks/useWalletPaymentAuthorizationModal";
import { PaymentsCheckoutRoutes } from "../navigation/routes";
import { walletPaymentSetCurrentStep } from "../store/actions/orchestration";
import { walletPaymentDetailsSelector } from "../store/selectors";
import {
  walletPaymentSelectedPaymentMethodIdOptionSelector,
  walletPaymentSelectedPaymentMethodOptionSelector,
  walletPaymentSelectedWalletIdOptionSelector,
  walletPaymentSelectedWalletOptionSelector
} from "../store/selectors/paymentMethods";
import {
  walletPaymentPspListSelector,
  walletPaymentSelectedPspSelector
} from "../store/selectors/psps";
import { walletPaymentTransactionSelector } from "../store/selectors/transaction";
import { WalletPaymentStepEnum } from "../types";
import {
  WalletPaymentOutcome,
  WalletPaymentOutcomeEnum
} from "../types/PaymentOutcomeEnum";

const WalletPaymentConfirmScreen = () => {
  const navigation = useIONavigation();

  const paymentDetailsPot = useIOSelector(walletPaymentDetailsSelector);
  const transactionPot = useIOSelector(walletPaymentTransactionSelector);
  const selectedWalletIdOption = useIOSelector(
    walletPaymentSelectedWalletIdOptionSelector
  );
  const selectedPaymentMethodIdOption = useIOSelector(
    walletPaymentSelectedPaymentMethodIdOptionSelector
  );

  const selectedPspOption = useIOSelector(walletPaymentSelectedPspSelector);

  const handleStartPaymentAuthorization = () =>
    pipe(
      sequenceS(O.Monad)({
        paymentDetail: pot.toOption(paymentDetailsPot),
        paymentMethodId: selectedPaymentMethodIdOption,
        selectedPsp: selectedPspOption,
        transaction: pot.toOption(transactionPot)
      }),
      O.map(({ paymentDetail, paymentMethodId, selectedPsp, transaction }) => {
        // In case of guest payment walletId could be undefined
        const walletId = O.toUndefined(selectedWalletIdOption);

        startPaymentAuthorizaton({
          paymentAmount: paymentDetail.amount as AmountEuroCents,
          paymentFees: (selectedPsp.taxPayerFee ?? 0) as AmountEuroCents,
          pspId: selectedPsp.idPsp ?? "",
          transactionId: transaction.transactionId,
          walletId,
          paymentMethodId
        });
      })
    );

  const handleAuthorizationOutcome = React.useCallback(
    (outcome: WalletPaymentOutcome) => {
      navigation.replace(PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR, {
        screen: PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_OUTCOME,
        params: {
          outcome
        }
      });
    },
    [navigation]
  );

  const {
    isLoading: isAuthUrlLoading,
    isError: isAuthUrlError,
    isPendingAuthorization,
    startPaymentAuthorizaton
  } = useWalletPaymentAuthorizationModal({
    onAuthorizationOutcome: handleAuthorizationOutcome
  });

  const isLoading = isAuthUrlLoading || isPendingAuthorization;
  const isError = isAuthUrlError;

  React.useEffect(() => {
    if (isError) {
      handleAuthorizationOutcome(WalletPaymentOutcomeEnum.GENERIC_ERROR);
    }
  }, [isError, handleAuthorizationOutcome]);

  const totalAmount = pipe(
    sequenceS(O.Monad)({
      taxFee: pipe(
        selectedPspOption,
        O.chainNullableK(({ taxPayerFee }) => taxPayerFee)
      ),
      paymentAmount: pipe(
        pot.toOption(paymentDetailsPot),
        O.map(({ amount }) => amount)
      )
    }),
    O.map(({ taxFee, paymentAmount }) => +paymentAmount + taxFee),
    O.getOrElse(() => 0)
  );

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
        onPress: handleStartPaymentAuthorization,
        disabled: isLoading,
        loading: isLoading
      }}
    >
      <ListItemHeader
        label={I18n.t("payment.confirm.payWith")}
        accessibilityLabel={I18n.t("payment.confirm.payWith")}
        iconName="creditCard"
      />
      <SelectedPaymentMethodModuleCheckout />
      <VSpacer size={24} />
      <ListItemHeader
        label={I18n.t("payment.confirm.fee")}
        accessibilityLabel={I18n.t("payment.confirm.fee")}
        iconName="psp"
      />
      <SelectedPspModuleCheckout />
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

const SelectedPaymentMethodModuleCheckout = () => {
  const dispatch = useIODispatch();

  const selectedWalletOption = useIOSelector(
    walletPaymentSelectedWalletOptionSelector
  );
  const selectedPaymentMethodOption = useIOSelector(
    walletPaymentSelectedPaymentMethodOptionSelector
  );

  const handleOnPress = () =>
    dispatch(
      walletPaymentSetCurrentStep(WalletPaymentStepEnum.PICK_PAYMENT_METHOD)
    );

  if (O.isSome(selectedWalletOption) && selectedWalletOption.value.details) {
    const details = selectedWalletOption.value.details;

    return (
      <ModuleCheckout
        paymentLogo={getPaymentLogo(details)}
        title={getPaymentTitle(details)}
        subtitle={getPaymentSubtitle(details)}
        ctaText={I18n.t("payment.confirm.editButton")}
        onPress={handleOnPress}
      />
    );
  }

  if (O.isSome(selectedPaymentMethodOption)) {
    return (
      <ModuleCheckout
        title={selectedPaymentMethodOption.value.description}
        ctaText={I18n.t("payment.confirm.editButton")}
        onPress={handleOnPress}
      />
    );
  }

  return null;
};

const SelectedPspModuleCheckout = () => {
  const dispatch = useIODispatch();

  const pspListPot = useIOSelector(walletPaymentPspListSelector);
  const selectedPspOption = useIOSelector(walletPaymentSelectedPspSelector);

  const pspList = pot.getOrElse(pspListPot, []);
  const bundleName = pipe(
    selectedPspOption,
    O.chainNullableK(({ bundleName }) => bundleName),
    O.getOrElse(() => "")
  );

  const taxFee = pipe(
    selectedPspOption,
    O.chainNullableK(({ taxPayerFee }) => taxPayerFee),
    O.getOrElse(() => 0)
  );

  return (
    <ModuleCheckout
      ctaText={
        pspList.length > 1 ? I18n.t("payment.confirm.editButton") : undefined
      }
      title={formatNumberCentsToAmount(taxFee, true, "right")}
      subtitle={`${I18n.t("payment.confirm.feeAppliedBy")} ${bundleName}`}
      onPress={() =>
        dispatch(walletPaymentSetCurrentStep(WalletPaymentStepEnum.PICK_PSP))
      }
    />
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

export { WalletPaymentConfirmScreen };

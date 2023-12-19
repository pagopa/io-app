import { StyleSheet, SafeAreaView } from "react-native";
import {
  Body,
  GradientScrollView,
  H3,
  IOSpacingScale,
  LabelLink,
  ListItemHeader,
  LoadingSpinner,
  ModuleCheckout,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React from "react";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import { AmountEuroCents } from "../../../../../definitions/pagopa/ecommerce/AmountEuroCents";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import I18n from "../../../../i18n";

import {
  walletPaymentAuthorization,
  walletPaymentCreateTransaction
} from "../store/actions/networking";
import {
  walletPaymentAuthorizationUrlSelector,
  walletPaymentDetailsSelector,
  walletPaymentPickedPaymentMethodSelector,
  walletPaymentPickedPspSelector,
  walletPaymentTransactionSelector
} from "../store/selectors";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { WalletPaymentRoutes } from "../navigation/routes";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { WalletPaymentTotalAmount } from "../components/WalletPaymentTotalAmount";
import {
  TypeEnum,
  WalletInfoDetails,
  WalletInfoDetails1,
  WalletInfoDetails2,
  WalletInfoDetails3
} from "../../../../../definitions/pagopa/walletv3/WalletInfoDetails";
import {
  WALLET_PAYMENT_TERMS_AND_CONDITIONS_URL,
  getPaymentLogo
} from "../../common/utils";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { format } from "../../../../utils/dates";
import { capitalize } from "../../../../utils/strings";
import { formatNumberCurrencyCentsOrDefault } from "../../../idpay/common/utils/strings";

const WalletPaymentConfirmScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const paymentDetailsPot = useIOSelector(walletPaymentDetailsSelector);
  const transactionPot = useIOSelector(walletPaymentTransactionSelector);
  const authorizationUrlPot = useIOSelector(
    walletPaymentAuthorizationUrlSelector
  );
  const selectedMethodOption = useIOSelector(
    walletPaymentPickedPaymentMethodSelector
  );
  const selectedPspOption = useIOSelector(walletPaymentPickedPspSelector);

  const isLoading =
    pot.isLoading(transactionPot) || pot.isLoading(authorizationUrlPot);

  const isError =
    pot.isError(transactionPot) || pot.isError(authorizationUrlPot);

  useHeaderSecondLevel({
    title: "",
    contextualHelp: emptyContextualHelp,
    faqCategories: ["payment"],
    supportRequest: true
  });

  useFocusEffect(
    React.useCallback(() => {
      dispatch(walletPaymentCreateTransaction.request({ paymentNotices: [] }));
    }, [dispatch])
  );

  React.useEffect(() => {
    if (pot.isSome(authorizationUrlPot)) {
      navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
        screen: WalletPaymentRoutes.WALLET_PAYMENT_OUTCOME
      });
    }
  }, [authorizationUrlPot, navigation]);

  const taxFee = pipe(
    selectedPspOption,
    O.chain(psp => O.fromNullable(psp.taxPayerFee)),
    O.getOrElse(() => 0)
  );

  const paymentAmount = pipe(
    pot.toUndefined(paymentDetailsPot),
    O.fromNullable,
    O.chain(paymentDetails => O.fromNullable(paymentDetails.amount)),
    O.getOrElse(() => 0)
  );

  const paymentMethodDetails = pipe(
    selectedMethodOption,
    O.chain(method => O.fromNullable(method.details)),
    O.toUndefined
  );

  const totalAmount = paymentAmount + taxFee;

  const selectedMethod = O.toUndefined(selectedMethodOption);

  const selectedPsp = O.toUndefined(selectedPspOption);

  const handleStartPaymentAuthorization = () => {
    if (selectedMethod && selectedPsp && pot.isSome(transactionPot)) {
      dispatch(
        walletPaymentAuthorization.request({
          paymentAmount: paymentAmount as AmountEuroCents,
          paymentFees: taxFee as AmountEuroCents,
          pspId: selectedPsp.idBundle ?? "",
          transactionId: transactionPot.value.transactionId,
          walletId: selectedMethod.walletId
        })
      );
    }
  };

  if (isError) {
    // TODO: Failure handling (https://pagopa.atlassian.net/browse/IOBP-471)
    return <></>;
  }

  if (paymentMethodDetails && selectedPsp && selectedMethod) {
    return (
      <GradientScrollView
        primaryActionProps={{
          label: `${I18n.t(
            "payment.confirm.pay"
          )} ${formatNumberCurrencyCentsOrDefault(totalAmount)}`,
          accessibilityLabel: `${I18n.t(
            "payment.confirm.pay"
          )} ${formatNumberCurrencyCentsOrDefault(totalAmount)}`,
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
          title={formatNumberCurrencyCentsOrDefault(taxFee)}
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
  }

  return (
    <SafeAreaView style={styles.loadingContainer}>
      <LoadingSpinner size={48} />
      <VSpacer size={24} />
      <H3 style={{ textAlign: "center" }}>
        {I18n.t("payment.confirm.loading.title")}
      </H3>
    </SafeAreaView>
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

const loadingContainerHorizontalMargin: IOSpacingScale = 48;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: loadingContainerHorizontalMargin
  }
});

export { WalletPaymentConfirmScreen };

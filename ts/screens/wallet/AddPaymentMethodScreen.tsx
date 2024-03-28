import { FooterWithButtons, VSpacer } from "@pagopa/io-app-design-system";
import { AmountInEuroCents, RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Route, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { ScrollView, View } from "react-native";
import { connect } from "react-redux";
import { PaymentRequestsGetResponse } from "../../../definitions/backend/PaymentRequestsGetResponse";
import BpayLogo from "../../../img/wallet/payment-methods/bancomat_pay.svg";
import CreditCard from "../../../img/wallet/payment-methods/creditcard.svg";
import PaypalLogo from "../../../img/wallet/payment-methods/paypal/paypal_logo.svg";
import { H1 } from "../../components/core/typography/H1";
import { IOStyles } from "../../components/core/variables/IOStyles";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import PaymentBannerComponent from "../../components/wallet/PaymentBannerComponent";
import PaymentMethodsList, {
  IPaymentMethod
} from "../../components/wallet/PaymentMethodsList";
import { walletAddBancomatStart } from "../../features/wallet/onboarding/bancomat/store/actions";
import { walletAddBPayStart } from "../../features/wallet/onboarding/bancomatPay/store/actions";
import {
  OnOnboardingCompleted,
  walletAddPaypalStart
} from "../../features/wallet/onboarding/paypal/store/actions";
import I18n from "../../i18n";
import {
  navigateBack,
  navigateToWalletAddCreditCard
} from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import {
  bancomatPayConfigSelector,
  isPaypalEnabledSelector
} from "../../store/reducers/backendStatus";
import { GlobalState } from "../../store/reducers/types";
import { paypalSelector } from "../../store/reducers/wallet/wallets";
import { AsyncAlert } from "../../utils/asyncAlert";
import { isTestEnv } from "../../utils/environment";

export type AddPaymentMethodScreenNavigationParams = Readonly<{
  inPayment: O.Option<{
    rptId: RptId;
    initialAmount: AmountInEuroCents;
    verifica: PaymentRequestsGetResponse;
    idPayment: string;
  }>;
  // if set, only those methods that can pay with pagoPA will be shown
  showOnlyPayablePaymentMethods?: true;
  keyFrom?: string;
}>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.newPaymentMethod.contextualHelpTitle",
  body: "wallet.newPaymentMethod.contextualHelpContent"
};

const getPaymentMethods = (
  props: Props,
  options: {
    onlyPaymentMethodCanPay: boolean;
    isPaymentOnGoing: boolean;
    isPaypalEnabled: boolean;
    canOnboardBPay: boolean;
  },
  navigateToAddCreditCard: () => void
): ReadonlyArray<IPaymentMethod> => [
  {
    name: I18n.t("wallet.methods.card.name"),
    description: I18n.t("wallet.methods.card.description"),
    icon: CreditCard,
    onPress: navigateToAddCreditCard,
    status: "implemented",
    section: "credit_card"
  },
  {
    name: I18n.t("wallet.methods.paypal.name"),
    description: I18n.t("wallet.methods.paypal.description"),
    icon: PaypalLogo,
    onPress: options.isPaypalEnabled
      ? async () => {
          const startPaypalOnboarding = () =>
            props.startPaypalOnboarding(
              options.isPaymentOnGoing ? "back" : "payment_method_details"
            );
          if (props.isPaypalAlreadyAdded) {
            await AsyncAlert(
              I18n.t("wallet.onboarding.paypal.paypalAlreadyAdded.alert.title"),
              I18n.t(
                "wallet.onboarding.paypal.paypalAlreadyAdded.alert.message"
              ),
              [
                {
                  text: I18n.t("global.buttons.continue"),
                  style: "default",
                  onPress: startPaypalOnboarding
                },
                {
                  text: I18n.t("global.buttons.cancel"),
                  style: "cancel"
                }
              ]
            );
            return;
          }
          startPaypalOnboarding();
        }
      : undefined,
    status: options.isPaypalEnabled ? "implemented" : "notImplemented",
    section: "paypal"
  },
  {
    name: I18n.t("wallet.methods.bancomatPay.name"),
    description: I18n.t("wallet.methods.bancomatPay.description"),
    icon: BpayLogo,
    status: options.canOnboardBPay ? "implemented" : "notImplemented",
    onPress: props.startBPayOnboarding,
    section: "digital_payments"
  }
];

/**
 * This is the screen presented to the user
 * when they request adding a new payment method.
 * From here, they can select their payment method
 * of choice (although only credit cards will be allowed
 * initially).
 *
 * This screen allows also to add a new payment method after a transaction is identified.
 *
 * The header banner provides a summary on the transaction to perform.
 *
 * Keep in mind that the rest of the "add credit card" process
 * is handled @https://www.pivotaltracker.com/story/show/157838293
 */
const AddPaymentMethodScreen: React.FunctionComponent<Props> = (
  props: Props
) => {
  const { inPayment, showOnlyPayablePaymentMethods, keyFrom } =
    useRoute<
      Route<"WALLET_ADD_PAYMENT_METHOD", AddPaymentMethodScreenNavigationParams>
    >().params;

  const navigateToAddCreditCard = () =>
    navigateToWalletAddCreditCard({
      inPayment,
      keyFrom
    });

  const buttonLabel = O.isSome(inPayment)
    ? I18n.t("global.buttons.back")
    : I18n.t("global.buttons.cancel");

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["wallet", "wallet_methods"]}
      headerTitle={
        O.isSome(inPayment)
          ? I18n.t("wallet.payWith.header")
          : I18n.t("wallet.addPaymentMethodTitle")
      }
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {O.isSome(inPayment) ? (
          <>
            <PaymentBannerComponent
              paymentReason={inPayment.value.verifica.causaleVersamento}
              currentAmount={inPayment.value.verifica.importoSingoloVersamento}
            />
            <View style={IOStyles.horizontalContentPadding}>
              <VSpacer size={24} />
              <H1>{I18n.t("wallet.payWith.title")}</H1>
              <VSpacer size={16} />
              {/* since we're paying show only those method can pay with pagoPA */}
              <PaymentMethodsList
                paymentMethods={getPaymentMethods(
                  props,
                  {
                    onlyPaymentMethodCanPay: true,
                    isPaymentOnGoing: O.isSome(inPayment),
                    isPaypalEnabled: props.isPaypalEnabled,
                    // can onboard bpay only when both FF are enabled
                    canOnboardBPay: props.canOnboardBPay && props.canPayWithBPay
                  },
                  navigateToAddCreditCard
                )}
              />
            </View>
          </>
        ) : (
          <PaymentMethodsList
            paymentMethods={getPaymentMethods(
              props,
              {
                onlyPaymentMethodCanPay: showOnlyPayablePaymentMethods === true,
                isPaymentOnGoing: O.isSome(inPayment),
                isPaypalEnabled: props.isPaypalEnabled,
                canOnboardBPay: props.canOnboardBPay
              },
              navigateToAddCreditCard
            )}
          />
        )}
      </ScrollView>
      <FooterWithButtons
        type="SingleButton"
        primary={{
          type: "Outline",
          buttonProps: {
            onPress: props.navigateBack,
            accessibilityLabel: buttonLabel,
            label: buttonLabel
          }
        }}
      />
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateBack: () => navigateBack(),
  startBPayOnboarding: () => dispatch(walletAddBPayStart()),
  startPaypalOnboarding: (onOboardingCompleted: OnOnboardingCompleted) =>
    dispatch(walletAddPaypalStart(onOboardingCompleted)),
  startAddBancomat: () => dispatch(walletAddBancomatStart())
});

const mapStateToProps = (state: GlobalState) => {
  const bpayConfig = bancomatPayConfigSelector(state);
  return {
    isPaypalAlreadyAdded: pot.isSome(paypalSelector(state)),
    isPaypalEnabled: isPaypalEnabledSelector(state),
    canOnboardBPay: bpayConfig.onboarding,
    canPayWithBPay: bpayConfig.payment
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddPaymentMethodScreen);

// to keep solid code encapsulation
export const testableFunctions = {
  getPaymentMethods: isTestEnv ? getPaymentMethods : undefined
};

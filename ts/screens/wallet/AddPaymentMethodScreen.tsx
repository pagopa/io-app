import { AmountInEuroCents, RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Content, View } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { NavigationStackScreenProps } from "react-navigation-stack";
import { connect } from "react-redux";
import { PaymentRequestsGetResponse } from "../../../definitions/backend/PaymentRequestsGetResponse";
import BpayLogo from "../../../img/wallet/payment-methods/bancomat_pay.svg";
import CreditCard from "../../../img/wallet/payment-methods/creditcard.svg";
import PaypalLogo from "../../../img/wallet/payment-methods/paypal/paypal_logo.svg";
import SatispayLogo from "../../../img/wallet/payment-methods/satispay-logo.svg";
import GDOLogo from "../../../img/wallet/unknown-gdo-primary.svg";
import { H1 } from "../../components/core/typography/H1";
import { IOStyles } from "../../components/core/variables/IOStyles";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import PaymentBannerComponent from "../../components/wallet/PaymentBannerComponent";
import PaymentMethodsList, {
  IPaymentMethod
} from "../../components/wallet/PaymentMethodsList";
import { bpdEnabled } from "../../config";
import { walletAddBancomatStart } from "../../features/wallet/onboarding/bancomat/store/actions";
import { walletAddBPayStart } from "../../features/wallet/onboarding/bancomatPay/store/actions";
import {
  OnOnboardingCompleted,
  walletAddPaypalStart
} from "../../features/wallet/onboarding/paypal/store/actions";
import { walletAddPrivativeStart } from "../../features/wallet/onboarding/privative/store/actions";
import { walletAddSatispayStart } from "../../features/wallet/onboarding/satispay/store/actions";
import I18n from "../../i18n";
import {
  navigateBack,
  navigateToWalletAddCreditCard
} from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { isPaypalEnabledSelector } from "../../store/reducers/backendStatus";
import { GlobalState } from "../../store/reducers/types";
import { paypalSelector } from "../../store/reducers/wallet/wallets";
import { AsyncAlert } from "../../utils/asyncAlert";

export type AddPaymentMethodScreenNavigationParams = Readonly<{
  inPayment: Option<{
    rptId: RptId;
    initialAmount: AmountInEuroCents;
    verifica: PaymentRequestsGetResponse;
    idPayment: string;
  }>;
  // if set, only those methods that can pay with pagoPA will be shown
  showOnlyPayablePaymentMethods?: true;
  keyFrom?: string;
}>;

type OwnProps =
  NavigationStackScreenProps<AddPaymentMethodScreenNavigationParams>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

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
  }
): ReadonlyArray<IPaymentMethod> => [
  {
    name: I18n.t("wallet.methods.card.name"),
    description: I18n.t("wallet.methods.card.description"),
    icon: CreditCard,
    onPress: props.navigateToAddCreditCard,
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
    status: !options.onlyPaymentMethodCanPay ? "implemented" : "notImplemented",
    onPress: props.startBPayOnboarding,
    section: "digital_payments"
  },
  {
    name: I18n.t("wallet.methods.satispay.name"),
    description: I18n.t("wallet.methods.satispay.description"),
    icon: SatispayLogo,
    onPress: props.startSatispayOnboarding,
    status: "notImplemented",
    section: "digital_payments"
  },
  {
    name: I18n.t("wallet.methods.pagobancomat.name"),
    description: I18n.t("wallet.methods.pagobancomat.description"),
    icon: CreditCard,
    onPress: props.startAddBancomat,
    status:
      bpdEnabled && !options.onlyPaymentMethodCanPay
        ? "implemented"
        : "notImplemented",
    section: "bancomat"
  },
  {
    name: I18n.t("wallet.methods.loyalty.name"),
    description: I18n.t("wallet.methods.loyalty.description"),
    icon: GDOLogo,
    onPress: props.startAddPrivative,
    status: !options.onlyPaymentMethodCanPay ? "implemented" : "notImplemented"
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
  const inPayment = props.navigation.getParam("inPayment");
  const canAddOnlyPayablePaymentMethod = props.navigation.getParam(
    "showOnlyPayablePaymentMethods"
  );

  const cancelButtonProps = {
    block: true,
    light: true,
    bordered: true,
    onPress: props.navigateBack,
    title: inPayment.isSome()
      ? I18n.t("global.buttons.back")
      : I18n.t("global.buttons.cancel")
  };

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["wallet", "wallet_methods"]}
      headerTitle={
        inPayment.isSome()
          ? I18n.t("wallet.payWith.header")
          : I18n.t("wallet.addPaymentMethodTitle")
      }
    >
      <SafeAreaView style={IOStyles.flex}>
        {inPayment.isSome() ? (
          <Content noPadded={true}>
            <PaymentBannerComponent
              paymentReason={inPayment.value.verifica.causaleVersamento}
              currentAmount={inPayment.value.verifica.importoSingoloVersamento}
            />
            <View style={IOStyles.horizontalContentPadding}>
              <View spacer={true} large={true} />
              <H1>{I18n.t("wallet.payWith.title")}</H1>
              <View spacer={true} />
              {/* since we're paying show only those method can pay with pagoPA */}
              <PaymentMethodsList
                paymentMethods={getPaymentMethods(props, {
                  onlyPaymentMethodCanPay: true,
                  isPaymentOnGoing: inPayment.isSome(),
                  isPaypalEnabled: props.isPaypalEnabled
                })}
              />
            </View>
          </Content>
        ) : (
          <Content noPadded={true} style={IOStyles.horizontalContentPadding}>
            <PaymentMethodsList
              paymentMethods={getPaymentMethods(props, {
                onlyPaymentMethodCanPay:
                  canAddOnlyPayablePaymentMethod === true,
                isPaymentOnGoing: inPayment.isSome(),
                isPaypalEnabled: props.isPaypalEnabled
              })}
            />
          </Content>
        )}
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={cancelButtonProps}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => ({
  navigateBack: () => navigateBack(),
  startBPayOnboarding: () => dispatch(walletAddBPayStart()),
  startSatispayOnboarding: () => dispatch(walletAddSatispayStart()),
  startPaypalOnboarding: (onOboardingCompleted: OnOnboardingCompleted) =>
    dispatch(walletAddPaypalStart(onOboardingCompleted)),
  startAddBancomat: () => dispatch(walletAddBancomatStart()),
  startAddPrivative: () => dispatch(walletAddPrivativeStart()),
  navigateToAddCreditCard: () =>
    navigateToWalletAddCreditCard({
      inPayment: props.navigation.getParam("inPayment"),
      keyFrom: props.navigation.getParam("keyFrom")
    })
});

const mapStateToProps = (state: GlobalState) => ({
  isPaypalAlreadyAdded: pot.isSome(paypalSelector(state)),
  isPaypalEnabled: isPaypalEnabledSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddPaymentMethodScreen);

import { Option } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-pagopa-commons/lib/pagopa";
import { Content, View } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { PaymentRequestsGetResponse } from "../../../definitions/backend/PaymentRequestsGetResponse";
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
import { walletAddPrivativeStart } from "../../features/wallet/onboarding/privative/store/actions";
import I18n from "../../i18n";
import {
  navigateBack,
  navigateToWalletAddCreditCard,
  navigateToWalletAddDigitalPaymentMethod
} from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { H1 } from "../../components/core/typography/H1";

type NavigationParams = Readonly<{
  inPayment: Option<{
    rptId: RptId;
    initialAmount: AmountInEuroCents;
    verifica: PaymentRequestsGetResponse;
    idPayment: string;
  }>;
  // if set it will shown only those method can pay with pagoPA
  showOnlyPayablePaymentMethods?: true;
  keyFrom?: string;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = ReturnType<typeof mapDispatchToProps> & OwnProps;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.newPaymentMethod.contextualHelpTitle",
  body: "wallet.newPaymentMethod.contextualHelpContent"
};

const getpaymentMethods = (
  props: Props,
  onlyPaymentMethodCanPay: boolean
): ReadonlyArray<IPaymentMethod> => [
  {
    name: I18n.t("wallet.methods.card.name"),
    description: I18n.t("wallet.methods.card.description"),
    onPress: props.navigateToAddCreditCard,
    status: "implemented",
    section: "credit_card"
  },
  {
    name: I18n.t("wallet.methods.postepay.name"),
    description: I18n.t("wallet.methods.postepay.description"),
    onPress: props.navigateToAddCreditCard,
    status: "implemented",
    section: "credit_card"
  },
  {
    name: I18n.t("wallet.methods.pagobancomat.name"),
    description: I18n.t("wallet.methods.pagobancomat.description"),
    onPress: props.startAddBancomat,
    status:
      bpdEnabled && !onlyPaymentMethodCanPay ? "implemented" : "notImplemented",
    section: "bancomat"
  },
  {
    name: I18n.t("wallet.methods.digital.name"),
    description: I18n.t("wallet.methods.digital.description"),
    onPress: props.navigateToWalletAddDigitalPaymentMethod,
    status: !onlyPaymentMethodCanPay ? "implemented" : "notImplemented",
    section: "digital_payments"
  },
  {
    name: I18n.t("wallet.methods.loyalty.name"),
    description: I18n.t("wallet.methods.loyalty.description"),
    onPress: props.startAddPrivative,
    status: !onlyPaymentMethodCanPay ? "implemented" : "notImplemented"
  },
  {
    name: I18n.t("wallet.methods.bonus.name"),
    description: I18n.t("wallet.methods.bonus.description"),
    status: "notImplemented"
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
                paymentMethods={getpaymentMethods(props, true)}
                navigateToAddCreditCard={props.navigateToAddCreditCard}
              />
            </View>
          </Content>
        ) : (
          <Content noPadded={true} style={IOStyles.horizontalContentPadding}>
            <PaymentMethodsList
              navigateToAddCreditCard={props.navigateToAddCreditCard}
              paymentMethods={getpaymentMethods(
                props,
                canAddOnlyPayablePaymentMethod === true
              )}
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
  navigateBack: () => dispatch(navigateBack()),
  startAddBancomat: () => dispatch(walletAddBancomatStart()),
  startAddPrivative: () => dispatch(walletAddPrivativeStart()),
  navigateToWalletAddDigitalPaymentMethod: () =>
    dispatch(navigateToWalletAddDigitalPaymentMethod()),
  navigateToAddCreditCard: () =>
    dispatch(
      navigateToWalletAddCreditCard({
        inPayment: props.navigation.getParam("inPayment"),
        keyFrom: props.navigation.getParam("keyFrom")
      })
    )
});

export default connect(undefined, mapDispatchToProps)(AddPaymentMethodScreen);

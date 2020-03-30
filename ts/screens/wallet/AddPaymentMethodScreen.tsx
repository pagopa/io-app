import { Option } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-pagopa-commons/lib/pagopa";
import { Content, H1, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { PaymentRequestsGetResponse } from "../../../definitions/backend/PaymentRequestsGetResponse";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import PaymentBannerComponent from "../../components/wallet/PaymentBannerComponent";
import PaymentMethodsList from "../../components/wallet/PaymentMethodsList";
import I18n from "../../i18n";
import {
  navigateToPaymentTransactionSummaryScreen,
  navigateToWalletAddCreditCard
} from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import variables from "../../theme/variables";

type NavigationParams = Readonly<{
  inPayment: Option<{
    rptId: RptId;
    initialAmount: AmountInEuroCents;
    verifica: PaymentRequestsGetResponse;
    idPayment: string;
  }>;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = ReturnType<typeof mapDispatchToProps> & OwnProps;

const styles = StyleSheet.create({
  paddedLR: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.newPaymentMethod.contextualHelpTitle",
  body: "wallet.newPaymentMethod.contextualHelpContent"
};

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
class AddPaymentMethodScreen extends React.PureComponent<Props> {
  public render(): React.ReactNode {
    const inPayment = this.props.navigation.getParam("inPayment");

    return (
      <BaseScreenComponent
        goBack={true}
        contextualHelpMarkdown={contextualHelpMarkdown}
        headerTitle={
          inPayment.isSome()
            ? I18n.t("wallet.payWith.header")
            : I18n.t("wallet.addPaymentMethodTitle")
        }
      >
        {inPayment.isSome() ? (
          <Content noPadded={true}>
            <PaymentBannerComponent
              paymentReason={inPayment.value.verifica.causaleVersamento}
              currentAmount={inPayment.value.verifica.importoSingoloVersamento}
            />
            <View style={styles.paddedLR}>
              <View spacer={true} large={true} />
              <H1>{I18n.t("wallet.payWith.title")}</H1>
              <View spacer={true} />
              <PaymentMethodsList
                navigateToAddCreditCard={this.props.navigateToAddCreditCard}
              />
            </View>
          </Content>
        ) : (
          <Content noPadded={true} style={styles.paddedLR}>
            <PaymentMethodsList
              navigateToAddCreditCard={this.props.navigateToAddCreditCard}
            />
          </Content>
        )}
        <View footer={true}>
          <ButtonDefaultOpacity
            block={true}
            light={true}
            bordered={true}
            onPress={(): boolean => this.props.navigation.goBack()}
          >
            <Text>
              {inPayment.isSome()
                ? I18n.t("global.buttons.back")
                : I18n.t("global.buttons.cancel")}
            </Text>
          </ButtonDefaultOpacity>
        </View>
      </BaseScreenComponent>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => ({
  navigateToTransactionSummary: () => {
    const maybeInPayment = props.navigation.getParam("inPayment");
    maybeInPayment.map(inPayment =>
      dispatch(
        navigateToPaymentTransactionSummaryScreen({
          rptId: inPayment.rptId,
          initialAmount: inPayment.initialAmount
        })
      )
    );
  },
  navigateToAddCreditCard: () =>
    dispatch(
      navigateToWalletAddCreditCard({
        inPayment: props.navigation.getParam("inPayment")
      })
    )
});

export default connect(
  undefined,
  mapDispatchToProps
)(AddPaymentMethodScreen);

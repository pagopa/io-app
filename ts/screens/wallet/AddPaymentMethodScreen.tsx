/**
 * This is the screen presented to the user
 * when they request adding a new payment method.
 * From here, they can select their payment method
 * of choice (although only credit cards will be allowed
 * initially).
 *
 * This screen allows also to add a new payment method after a transaction is identified
 * the header banner provide a summary on the transaction to perform.
 *
 * Keep in mind that the rest of the "add credit card" process
 * is handled @https://www.pivotaltracker.com/story/show/157838293
 */
import {
  Body,
  Button,
  Container,
  Content,
  H1,
  Left,
  Right,
  Text,
  View
} from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import { AmountInEuroCents } from "italia-ts-commons/lib/pagopa";
import { EnteBeneficiario } from "../../../definitions/backend/EnteBeneficiario";
import GoBackButton from "../../components/GoBackButton";
import { InstabugButtons } from "../../components/InstabugButtons";
import { WalletStyles } from "../../components/styles/wallet";
import AppHeader from "../../components/ui/AppHeader";
import PaymentBannerComponent from "../../components/wallet/PaymentBannerComponent";
import PaymentMethodsList from "../../components/wallet/PaymentMethodsList";
import I18n from "../../i18n";
import { GlobalState } from "../../store/reducers/types";
import {
  getCurrentAmountFromGlobalStateWithVerificaResponse,
  getPaymentReason,
  getPaymentRecipientFromGlobalStateWithVerificaResponse,
  isGlobalStateWithVerificaResponse
} from "../../store/reducers/wallet/payment";

type ReduxMappedProps =
  | Readonly<{
      isInTransaction: false;
    }>
  | Readonly<{
      // if isInTransaction is true, the screen includes:
      // - a different title inside the header
      // - the banner with the summary of the transaction
      // - the visualization of the title "Pay with"
      // TODO:
      // - implement the code so that when the screen is accessed during the identification of a
      //    transaction, the banner and the title are displayed
      //    https://www.pivotaltracker.com/n/projects/2048617/stories/158395136
      isInTransaction: true;
      paymentReason?: string;
      currentAmount: AmountInEuroCents;
      recipient?: EnteBeneficiario;
    }>;

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}> &
  ReduxMappedProps;

class AddPaymentMethodScreen extends React.PureComponent<Props> {
  public render(): React.ReactNode {
    return (
      <Container>
        <AppHeader>
          <Left>
            <GoBackButton />
          </Left>
          <Body>
            {this.props.isInTransaction ? (
              <Text>{I18n.t("wallet.payWith.header")}</Text>
            ) : (
              <Text>{I18n.t("wallet.addPaymentMethodTitle")}</Text>
            )}
          </Body>
          <Right>
            <InstabugButtons />
          </Right>
        </AppHeader>
        {this.props.isInTransaction ? (
          <Content noPadded={true}>
            <PaymentBannerComponent
              paymentReason={this.props.paymentReason}
              currentAmount={this.props.currentAmount}
              recipient={this.props.recipient}
            />
            <View style={WalletStyles.paddedLR}>
              <View spacer={true} large={true} />
              <H1>{I18n.t("wallet.payWith.title")}</H1>
              <View spacer={true} />
              <PaymentMethodsList navigation={this.props.navigation} />
            </View>
          </Content>
        ) : (
          <Content>
            <PaymentMethodsList navigation={this.props.navigation} />
          </Content>
        )}
        <View footer={true}>
          <Button
            block={true}
            light={true}
            bordered={true}
            onPress={(): boolean => this.props.navigation.goBack()}
          >
            <Text>{I18n.t("wallet.cancel")}</Text>
          </Button>
        </View>
      </Container>
    );
  }
}

function mapStateToProps(state: GlobalState): ReduxMappedProps {
  return isGlobalStateWithVerificaResponse(state)
    ? {
        isInTransaction: true,
        paymentReason: getPaymentReason(state).toUndefined(), // this could be empty as per pagoPA definition
        currentAmount: getCurrentAmountFromGlobalStateWithVerificaResponse(
          state
        ),
        recipient: getPaymentRecipientFromGlobalStateWithVerificaResponse(
          state
        ).toUndefined() // this could be empty as per pagoPA definition
      }
    : {
        isInTransaction: false
      };
}

export default connect(mapStateToProps)(AddPaymentMethodScreen);

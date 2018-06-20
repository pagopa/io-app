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
  Text,
  View
} from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { WalletAPI } from "../../api/wallet/wallet-api";
import { WalletStyles } from "../../components/styles/wallet";
import AppHeader from "../../components/ui/AppHeader";
import PaymentBannerComponent from "../../components/wallet/PaymentBannerComponent";
import AddNewPaymentMethodComponent from "../../components/wallet/payWith/addNewPaymentMethodComponent";
import I18n from "../../i18n";
import Icon from "../../theme/font-icons/io-icon-font/index";
import variables from "../../theme/variables";
import { TransactionSummary } from "../../types/wallet";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

const transaction: Readonly<
  TransactionSummary
> = WalletAPI.getTransactionSummary();

export class AddPaymentMethodScreen extends React.Component<Props, never> {
  /**
   * if it return true, the screen includes:
   * - a different title inside the header
   * - the banner with the summary of the transaction
   * - the visualization of the title "Pay with"
   * TODO:
   * - implement the code so that when the screen is accessed during the identification of a
   *    transaction, the banner and the title are displayed
   *    https://www.pivotaltracker.com/n/projects/2048617/stories/158395136
   */
  private isInTransaction() {
    return true;
  }

  public render(): React.ReactNode {
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button
              transparent={true}
              onPress={_ => this.props.navigation.goBack()}
            >
              <Icon name="io-back" size={variables.iconSize3} />
            </Button>
          </Left>
          <Body>
            {this.isInTransaction() ? (
              <Text> {I18n.t("wallet.payWith.header")} </Text>
            ) : (
              <Text> {I18n.t("wallet.addPaymentMethodTitle")} </Text>
            )}
          </Body>
        </AppHeader>
        <Content noPadded={true}>
          {this.isInTransaction() && (
            <PaymentBannerComponent
              navigation={this.props.navigation}
              paymentReason={transaction.paymentReason}
              currentAmount={transaction.totalAmount.toString()}
              entity={transaction.entityName}
            />
          )}
          <View style={WalletStyles.paddedLR}>
            <View spacer={true} large={true} />
            {this.isInTransaction() && (
              <H1> {I18n.t("wallet.payWith.title")} </H1>
            )}
            <View spacer={true} />
            <AddNewPaymentMethodComponent navigation={this.props.navigation} />
          </View>
        </Content>
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

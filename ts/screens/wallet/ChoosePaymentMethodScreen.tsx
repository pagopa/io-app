/**
 * This screen allows the user to select the payment method for a selected transaction
 * TODO:
 *  - integrate credit card component
 *   https://www.pivotaltracker.com/n/projects/2048617/stories/157422715
 *  - implement the proper navigation
 *    https://www.pivotaltracker.com/n/projects/2048617/stories/158395136
 */
import {
  Body,
  Button,
  Container,
  Content,
  H1,
  Left,
  List,
  Text,
  View
} from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { WalletAPI } from "../../api/wallet/wallet-api";
import { WalletStyles } from "../../components/styles/wallet";
import AppHeader from "../../components/ui/AppHeader";
import CreditCardComponent from "../../components/wallet/CreditCardComponent";
import PaymentBannerComponent from "../../components/wallet/PaymentBannerComponent";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import Icon from "../../theme/font-icons/io-icon-font/index";
import variables from "../../theme/variables";
import { CreditCard } from "../../types/CreditCard";
import { TransactionSummary } from "../../types/wallet";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

const transaction: Readonly<
  TransactionSummary
> = WalletAPI.getTransactionSummary();
const cards: ReadonlyArray<CreditCard> = WalletAPI.getCreditCards();

export class ChoosePaymentMethodScreen extends React.Component<Props, never> {
  private goBack() {
    this.props.navigation.goBack();
  }

  public render(): React.ReactNode {
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={() => this.goBack()}>
              <Icon name="io-back" size={variables.iconSize1} />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("wallet.payWith.header")}</Text>
          </Body>
        </AppHeader>
        <Content noPadded={true}>
          <PaymentBannerComponent
            navigation={this.props.navigation}
            paymentReason={transaction.paymentReason}
            currentAmount={transaction.totalAmount.toString()}
            entity={transaction.entityName}
          />

          <View style={WalletStyles.paddedLR}>
            <View spacer={true} />
            <H1> {I18n.t("wallet.payWith.title")} </H1>

            <View spacer={true} />
            <Text> {I18n.t("wallet.payWith.info")}</Text>
            <View spacer={true} />
            <List
              removeClippedSubviews={false}
              dataArray={cards as ReadonlyArray<any>} // // tslint:disable-line: readonly-array
              renderRow={(item): React.ReactElement<any> => (
                <CreditCardComponent
                  navigation={this.props.navigation}
                  item={item}
                />
              )}
            />
          </View>
        </Content>
        <View footer={true}>
          <Button
            block={true}
            onPress={(): boolean =>
              this.props.navigation.navigate(ROUTES.WALLET_ADD_PAYMENT_METHOD)
            }
          >
            <Text>{I18n.t("wallet.newPaymentMethod.newMethod")}</Text>
          </Button>
          <View spacer={true} />
          <Button
            block={true}
            cancel={true}
            onPress={(): boolean => this.props.navigation.goBack()}
          >
            <Text>{I18n.t("wallet.cancel")}</Text>
          </Button>
        </View>
      </Container>
    );
  }
}

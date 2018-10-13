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
import { Option } from "fp-ts/lib/Option";
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

import GoBackButton from "../../components/GoBackButton";
import { InstabugButtons } from "../../components/InstabugButtons";
import { WalletStyles } from "../../components/styles/wallet";
import AppHeader from "../../components/ui/AppHeader";
import PaymentBannerComponent from "../../components/wallet/PaymentBannerComponent";
import PaymentMethodsList from "../../components/wallet/PaymentMethodsList";
import I18n from "../../i18n";
import { GlobalState } from "../../store/reducers/types";
import { getPaymentIdFromGlobalState } from "../../store/reducers/wallet/payment";

type ReduxMappedProps = Readonly<{
  paymentId: Option<string>;
}>;

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}> &
  ReduxMappedProps;

class AddPaymentMethodScreen extends React.PureComponent<Props> {
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
    // if the current state has a paymentId it means we're in a payment flow
    return this.props.paymentId.isSome();
  }

  public render(): React.ReactNode {
    return (
      <Container>
        <AppHeader>
          <Left>
            <GoBackButton />
          </Left>
          <Body>
            {this.isInTransaction() ? (
              <Text>{I18n.t("wallet.payWith.header")}</Text>
            ) : (
              <Text>{I18n.t("wallet.addPaymentMethodTitle")}</Text>
            )}
          </Body>
          <Right>
            <InstabugButtons />
          </Right>
        </AppHeader>
        {this.isInTransaction() ? (
          <Content noPadded={true}>
            <PaymentBannerComponent />
            <View style={WalletStyles.paddedLR}>
              <View spacer={true} large={true} />
              {this.isInTransaction() && (
                <H1>{I18n.t("wallet.payWith.title")}</H1>
              )}
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
  return {
    paymentId: getPaymentIdFromGlobalState(state)
  };
}

export default connect(mapStateToProps)(AddPaymentMethodScreen);

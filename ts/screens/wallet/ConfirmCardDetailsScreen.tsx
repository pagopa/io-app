/**
 * This screen presents a summary on the credit card after the user
 * inserted the data required to save a new card
 */
import { Option } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import {
  Body,
  Container,
  Content,
  H1,
  Left,
  Right,
  Text,
  View
} from "native-base";
import * as React from "react";
import { Switch } from "react-native";
import { Col, Grid } from "react-native-easy-grid";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { PaymentRequestsGetResponse } from "../../../definitions/backend/PaymentRequestsGetResponse";
import GoBackButton from "../../components/GoBackButton";
import { InstabugButtons } from "../../components/InstabugButtons";
import AppHeader from "../../components/ui/AppHeader";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import CardComponent from "../../components/wallet/card/CardComponent";
import I18n from "../../i18n";
import { navigateToWalletTransactionsScreen } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { addCreditCardRequest } from "../../store/actions/wallet/wallets";
import { GlobalState } from "../../store/reducers/types";
import { getNewCreditCard } from "../../store/reducers/wallet/wallets";
import { CreditCard, Wallet } from "../../types/pagopa";
import { UNKNOWN_CARD } from "../../types/unknown";

type NavigationParams = Readonly<{
  inPayment: Option<{
    rptId: RptId;
    initialAmount: AmountInEuroCents;
    verifica: PaymentRequestsGetResponse;
    paymentId: string;
  }>;
}>;

type ReduxMappedStateProps = Readonly<{
  wallet: Wallet;
}>;

type ReduMappedDispatchProps = Readonly<{
  addCreditCard: (creditCard: CreditCard, favorite: boolean) => void;
}>;

type Props = ReduxMappedStateProps &
  ReduMappedDispatchProps &
  NavigationInjectedProps<NavigationParams>;

type State = Readonly<{
  favorite: boolean;
}>;

class ConfirmCardDetailsScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      favorite: true
    };
  }

  // It supports switch state changes
  private onValueChange = () => {
    this.setState(prevState => ({
      favorite: !prevState.favorite
    }));
  };

  private goBack = () => {
    this.props.navigation.goBack();
  };

  public render(): React.ReactNode {
    const primaryButtonProps = {
      block: true,
      primary: true,
      onPress: () =>
        this.props.addCreditCard(
          this.props.wallet.creditCard,
          this.state.favorite
        ),
      title: I18n.t("wallet.saveCard.save")
    };

    const secondaryButtonProps = {
      block: true,
      light: true,
      bordered: true,
      onPress: this.goBack,
      title: I18n.t("global.buttons.cancel")
    };

    return (
      <Container>
        <AppHeader>
          <Left>
            <GoBackButton />
          </Left>
          <Body>
            <Text>{I18n.t("wallet.saveCard.header")}</Text>
          </Body>
          <Right>
            <InstabugButtons />
          </Right>
        </AppHeader>
        <Content>
          <H1>{I18n.t("wallet.saveCard.title")}</H1>
          <CardComponent
            wallet={this.props.wallet}
            menu={false}
            showFavoriteIcon={false}
            lastUsage={false}
            navigateToWalletTransactions={(wallet: Wallet) =>
              this.props.navigation.dispatch(
                navigateToWalletTransactionsScreen({ selectedWallet: wallet })
              )
            }
          />
          <View spacer={true} />
          <Grid>
            <Col size={5}>
              <Text bold={true}>{I18n.t("wallet.saveCard.infoTitle")}</Text>
              <Text>{I18n.t("wallet.saveCard.info")}</Text>
            </Col>
            <Col size={1}>
              <Switch
                value={this.state.favorite}
                onValueChange={this.onValueChange}
              />
            </Col>
          </Grid>
        </Content>
        <FooterWithButtons
          leftButton={primaryButtonProps}
          rightButton={secondaryButtonProps}
          inlineHalf={true}
        />
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => {
  const card = getNewCreditCard(state);
  if (card.isNone()) {
    return {
      wallet: UNKNOWN_CARD
    };
  }
  return {
    /**
     * Build a `Wallet` for the `CardComponent`
     * component to render
     */
    wallet: {
      creditCard: card.value,
      type: "CREDIT_CARD",
      idWallet: -1,
      psp: undefined
    }
  };
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  props: Props
): ReduMappedDispatchProps => ({
  addCreditCard: (creditCard: CreditCard, setAsFavorite: boolean) =>
    dispatch(
      addCreditCardRequest({
        creditCard,
        setAsFavorite,
        inPayment: props.navigation.getParam("inPayment")
      })
    )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConfirmCardDetailsScreen);

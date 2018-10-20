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
import { navigateToWalletHome } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { paymentRequestPickPaymentMethod } from "../../store/actions/wallet/payment";
import {
  addWalletCreditCardInit,
  runStartOrResumeAddCreditCardSaga
} from "../../store/actions/wallet/wallets";
import { GlobalState } from "../../store/reducers/types";
import { WalletsState } from "../../store/reducers/wallet/wallets";
import { CreditCard } from "../../types/pagopa";
import { showToast } from "../../utils/showToast";

type NavigationParams = Readonly<{
  creditCard: CreditCard;
  inPayment: Option<{
    rptId: RptId;
    initialAmount: AmountInEuroCents;
    verifica: PaymentRequestsGetResponse;
    paymentId: string;
  }>;
}>;

type ReduxMappedStateProps = Readonly<{
  creditCardAddWallet: string;
}>;

type ReduxMappedDispatchProps = Readonly<{
  addWalletCreditCardInit: () => void;
  runStartOrResumeAddCreditCardSaga: (
    creditCard: CreditCard,
    setAsFavorite: boolean
  ) => void;
}>;

type Props = ReduxMappedDispatchProps &
  NavigationInjectedProps<NavigationParams>;

type State = Readonly<{
  favorite: boolean;
}>;

class ConfirmCardDetailsScreen extends React.Component<Props, State> {
  public componentDidMount() {
    // reset the credit card boarding state on mount
    this.props.addWalletCreditCardInit();
  }

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
    const creditCard = this.props.navigation.getParam("creditCard");
    const wallet = {
      creditCard,
      type: "CREDIT_CARD",
      idWallet: -1, // FIXME: no magic numbers
      psp: undefined
    };

    const primaryButtonProps = {
      block: true,
      primary: true,
      onPress: () =>
        this.props.runStartOrResumeAddCreditCardSaga(
          creditCard,
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
            wallet={wallet}
            menu={false}
            showFavoriteIcon={false}
            lastUsage={false}
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

// TODO: add loading/error states
const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => ({
  // creditCardAddWallet: state.wallet.wallets.creditCardAddWallet,
  // creditCardVerification: state.wallet.wallets.creditCardVerification,
  // creditCardCheckout3ds: state.wallet.wallets.creditCardCheckout3ds,
  // walletById: state.wallet.wallets.walletById
  creditCardAddWallet: ""
});

const mapDispatchToProps = (
  dispatch: Dispatch,
  props: NavigationInjectedProps<NavigationParams>
): ReduxMappedDispatchProps => {
  const navigateToNextScreen = () => {
    const inPayment = props.navigation.getParam("inPayment");
    if (inPayment.isSome()) {
      dispatch(
        paymentRequestPickPaymentMethod({
          rptId: inPayment.value.rptId,
          initialAmount: inPayment.value.initialAmount,
          verifica: inPayment.value.verifica,
          paymentId: inPayment.value.paymentId
        })
      );
    } else {
      dispatch(navigateToWalletHome());
    }
  };
  return {
    addWalletCreditCardInit: () => dispatch(addWalletCreditCardInit()),
    runStartOrResumeAddCreditCardSaga: (
      creditCard: CreditCard,
      setAsFavorite: boolean
    ) =>
      dispatch(
        runStartOrResumeAddCreditCardSaga({
          creditCard,
          setAsFavorite,
          onSuccess: () => {
            showToast(I18n.t("wallet.newPaymentMethod.successful"), "success");
            navigateToNextScreen();
          },
          onFailure: () => {
            showToast(I18n.t("wallet.newPaymentMethod.failed"), "danger");
            navigateToNextScreen();
          }
        })
      )
  };
};

export default connect(mapStateToProps)(ConfirmCardDetailsScreen);

/**
 * This screen presents a summary on the credit card after the user
 * inserted the data required to save a new card
 */
import { none, Option, some } from "fp-ts/lib/Option";
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
import { Modal, Switch } from "react-native";
import { Col, Grid } from "react-native-easy-grid";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import { PaymentRequestsGetResponse } from "../../../definitions/backend/PaymentRequestsGetResponse";
import Checkout3DsComponent from "../../components/Checkout3DsComponent";
import GoBackButton from "../../components/GoBackButton";
import { withErrorModal } from "../../components/helpers/withErrorModal";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import { InstabugButtons } from "../../components/InstabugButtons";
import AppHeader from "../../components/ui/AppHeader";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import CardComponent from "../../components/wallet/card/CardComponent";
import I18n from "../../i18n";
import {
  navigateToPaymentPickPaymentMethodScreen,
  navigateToWalletHome
} from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import {
  addWalletCreditCardInit,
  creditCardCheckout3dsSuccess,
  runStartOrResumeAddCreditCardSaga
} from "../../store/actions/wallet/wallets";
import { GlobalState } from "../../store/reducers/types";
import { CreditCard, Psp } from "../../types/pagopa";
import * as pot from "../../types/pot";
import { showToast } from "../../utils/showToast";

type NavigationParams = Readonly<{
  creditCard: CreditCard;
  inPayment: Option<{
    rptId: RptId;
    initialAmount: AmountInEuroCents;
    verifica: PaymentRequestsGetResponse;
    paymentId: string;
    psps: ReadonlyArray<Psp>;
  }>;
}>;

type ReduxMappedStateProps = Readonly<{
  isLoading: boolean;
  checkout3dsUrl: Option<string>;
  error: Option<string>;
}>;

type ReduxMappedDispatchProps = Readonly<{
  addWalletCreditCardInit: () => void;
  creditCardCheckout3dsSuccess: () => void;
  runStartOrResumeAddCreditCardSaga: (
    creditCard: CreditCard,
    setAsFavorite: boolean
  ) => void;
  onCancel: () => void;
}>;

type ReduxMergedProps = Readonly<{
  onRetry: () => void;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = ReduxMappedStateProps &
  ReduxMappedDispatchProps &
  ReduxMergedProps &
  OwnProps;

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
        <Modal
          animationType="fade"
          transparent={false}
          visible={this.props.checkout3dsUrl.isSome()}
        >
          {this.props.checkout3dsUrl.isSome() && (
            <Checkout3DsComponent
              url={this.props.checkout3dsUrl.value}
              onCheckout3dsSuccess={this.props.creditCardCheckout3dsSuccess}
            />
          )}
        </Modal>
      </Container>
    );
  }
}

// TODO: add error states
const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => {
  const {
    creditCardAddWallet,
    creditCardVerification,
    creditCardCheckout3ds,
    walletById
  } = state.wallet.wallets;

  const isLoading =
    pot.isLoading(creditCardAddWallet) ||
    pot.isLoading(creditCardVerification) ||
    pot.isLoading(walletById);

  const error = pot.isError(creditCardAddWallet)
    ? some(creditCardAddWallet.error.message)
    : pot.isError(creditCardVerification)
      ? some("GENERIC_ERROR")
      : pot.isError(walletById)
        ? some("GENERIC_ERROR")
        : none;

  return {
    isLoading,
    error,
    checkout3dsUrl: pot.isLoading(creditCardCheckout3ds)
      ? pot.toOption(creditCardCheckout3ds)
      : none
  };
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  props: NavigationInjectedProps<NavigationParams>
): ReduxMappedDispatchProps => {
  const navigateToNextScreen = () => {
    const inPayment = props.navigation.getParam("inPayment");
    if (inPayment.isSome()) {
      dispatch(navigateToPaymentPickPaymentMethodScreen(inPayment.value));
    } else {
      dispatch(navigateToWalletHome());
    }
  };
  return {
    addWalletCreditCardInit: () => dispatch(addWalletCreditCardInit()),
    creditCardCheckout3dsSuccess: () =>
      dispatch(creditCardCheckout3dsSuccess()),
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
      ),
    onCancel: () => props.navigation.goBack()
  };
};

const mergeProps = (
  stateProps: ReduxMappedStateProps,
  dispatchProps: ReduxMappedDispatchProps,
  ownProps: OwnProps
) => {
  const maybeError = stateProps.error;
  const isRetriableError =
    maybeError.isNone() || maybeError.value !== "ALREADY_EXISTS";
  const onRetry = isRetriableError
    ? () => {
        dispatchProps.runStartOrResumeAddCreditCardSaga(
          ownProps.navigation.getParam("creditCard"),
          false // FIXME: unfortunately we can't access the internal component state from here?
        );
      }
    : undefined;
  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    ...{
      onRetry
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(
  withErrorModal(withLoadingSpinner(ConfirmCardDetailsScreen), (_: string) => _)
);

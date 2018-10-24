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
import NoticeBox from "../../components/NoticeBox";
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
import { CreditCard, Wallet } from "../../types/pagopa";
import * as pot from "../../types/pot";
import { showToast } from "../../utils/showToast";
import { dispatchPickPspOrConfirm } from "./payment/common";

type NavigationParams = Readonly<{
  creditCard: CreditCard;
  inPayment: Option<{
    rptId: RptId;
    initialAmount: AmountInEuroCents;
    verifica: PaymentRequestsGetResponse;
    idPayment: string;
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
    const isInPayment = this.props.navigation.getParam("inPayment").isSome();

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
      title: isInPayment
        ? I18n.t("wallet.saveCardInPayment.save")
        : I18n.t("wallet.saveCard.save")
    };

    const secondaryButtonProps = {
      block: true,
      light: true,
      bordered: true,
      onPress: this.goBack,
      title: I18n.t("global.buttons.back")
    };

    return (
      <Container>
        <AppHeader>
          <Left>
            <GoBackButton />
          </Left>
          <Body>
            <Text>
              {isInPayment
                ? I18n.t("wallet.saveCardInPayment.header")
                : I18n.t("wallet.saveCard.header")}
            </Text>
          </Body>
          <Right>
            <InstabugButtons />
          </Right>
        </AppHeader>
        <Content>
          <H1>
            {isInPayment
              ? I18n.t("wallet.saveCardInPayment.title")
              : I18n.t("wallet.saveCard.title")}
          </H1>
          <CardComponent
            wallet={wallet}
            type="Full"
            hideMenu={true}
            hideFavoriteIcon={true}
          />
          <View spacer={true} />
          <NoticeBox
            backgroundColor={"#c1f4f2"}
            iconProps={{
              name: "io-notice",
              size: 32
            }}
          >
            <Text bold={true}>{I18n.t("wallet.saveCard.notice")}</Text>
          </NoticeBox>
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
          leftButton={secondaryButtonProps}
          rightButton={primaryButtonProps}
          inlineOneThird={true}
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

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => {
  const {
    creditCardAddWallet,
    creditCardVerification,
    creditCardCheckout3ds,
    walletById
  } = state.wallet.wallets;

  const { psps } = state.wallet.payment;

  const isLoading =
    pot.isLoading(creditCardAddWallet) ||
    pot.isLoading(creditCardVerification) ||
    pot.isLoading(walletById) ||
    pot.isLoading(psps);

  const error =
    (pot.isError(creditCardAddWallet) &&
      creditCardAddWallet.error !== "ALREADY_EXISTS") ||
    pot.isError(creditCardVerification) ||
    pot.isError(walletById) ||
    pot.isError(psps)
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
  const navigateToNextScreen = (maybeWallet: Option<Wallet>) => {
    const inPayment = props.navigation.getParam("inPayment");
    if (inPayment.isSome()) {
      const { rptId, initialAmount, verifica, idPayment } = inPayment.value;
      dispatchPickPspOrConfirm(dispatch)(
        rptId,
        initialAmount,
        verifica,
        idPayment,
        maybeWallet,
        failureReason => {
          // trying to use this card for the current payment has failed, show
          // a toast and navigate to the wallet selection screen
          if (failureReason === "FETCH_PSPS_FAILURE") {
            // fetching the PSPs for the payment has failed
            showToast(I18n.t("wallet.payWith.fetchPspFailure"), "warning");
          } else if (failureReason === "NO_PSPS_AVAILABLE") {
            // this card cannot be used for this payment
            // TODO: perhaps we can temporarily hide the selected wallet from
            //       the list of available wallets
            showToast(I18n.t("wallet.payWith.noPspsAvailable"), "danger");
          }
          // navigate to the wallet selection screen
          dispatch(
            navigateToPaymentPickPaymentMethodScreen({
              rptId,
              initialAmount,
              verifica,
              idPayment
            })
          );
        }
      );
    } else {
      dispatch(navigateToWalletHome());
    }
  };
  return {
    addWalletCreditCardInit: () => dispatch(addWalletCreditCardInit()),
    creditCardCheckout3dsSuccess: () =>
      dispatch(creditCardCheckout3dsSuccess("done")),
    runStartOrResumeAddCreditCardSaga: (
      creditCard: CreditCard,
      setAsFavorite: boolean
    ) =>
      dispatch(
        runStartOrResumeAddCreditCardSaga({
          creditCard,
          setAsFavorite,
          onSuccess: addedWallet => {
            showToast(I18n.t("wallet.newPaymentMethod.successful"), "success");
            navigateToNextScreen(some(addedWallet));
          },
          onFailure: error => {
            showToast(
              I18n.t(
                error === "ALREADY_EXISTS"
                  ? "wallet.newPaymentMethod.failedCardAlreadyExists"
                  : "wallet.newPaymentMethod.failed"
              ),
              "danger"
            );
            navigateToNextScreen(none);
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

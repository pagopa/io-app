/**
 * This screen presents a summary on the credit card after the user
 * inserted the data required to save a new card
 */
import { none, Option, some } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-pagopa-commons/lib/pagopa";
import * as pot from "italia-ts-commons/lib/pot";
import { Content, H1, Text, View } from "native-base";
import * as React from "react";
import { Modal, Switch } from "react-native";
import { Col, Grid } from "react-native-easy-grid";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { TypeEnum } from "../../../definitions/pagopa/Wallet";

import { PaymentRequestsGetResponse } from "../../../definitions/backend/PaymentRequestsGetResponse";
import Checkout3DsComponent from "../../components/Checkout3DsComponent";
import { withErrorModal } from "../../components/helpers/withErrorModal";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import NoticeBox from "../../components/NoticeBox";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
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

type ReduxMergedProps = Readonly<{
  onRetry?: () => void;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  ReduxMergedProps &
  OwnProps;

type State = Readonly<{
  setAsFavourite: boolean;
}>;

class ConfirmCardDetailsScreen extends React.Component<Props, State> {
  public componentDidMount() {
    // reset the credit card boarding state on mount
    this.props.addWalletCreditCardInit();
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      setAsFavourite: true
    };
  }

  // It supports switch state changes
  private onSetFavouriteValueChange = () => {
    this.setState(prevState => ({
      setAsFavourite: !prevState.setAsFavourite
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
      type: TypeEnum.CREDIT_CARD,
      idWallet: -1, // FIXME: no magic numbers
      psp: undefined
    };

    const primaryButtonProps = {
      block: true,
      primary: true,
      onPress: () =>
        this.props.runStartOrResumeAddCreditCardSaga(
          creditCard,
          this.state.setAsFavourite
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
      <BaseScreenComponent
        goBack={true}
        headerTitle={
          isInPayment
            ? I18n.t("wallet.saveCardInPayment.header")
            : I18n.t("wallet.saveCard.header")
        }
      >
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
                value={this.state.setAsFavourite}
                onValueChange={this.onSetFavouriteValueChange}
              />
            </Col>
          </Grid>
        </Content>
        <FooterWithButtons
          type="TwoButtonsInlineHalf"
          leftButton={secondaryButtonProps}
          rightButton={primaryButtonProps}
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
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
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
      ? some(I18n.t("wallet.saveCard.temporaryError"))
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
) => {
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
  stateProps: ReturnType<typeof mapStateToProps>,
  dispatchProps: ReturnType<typeof mapDispatchToProps>,
  ownProps: OwnProps
) => {
  const maybeError = stateProps.error;
  const isRetriableError =
    maybeError.isNone() || maybeError.value !== "ALREADY_EXISTS";
  const onRetry = isRetriableError
    ? () => {
        dispatchProps.runStartOrResumeAddCreditCardSaga(
          ownProps.navigation.getParam("creditCard"),
          // FIXME: Unfortunately we can't access the internal component state
          //        from here so we cannot know if the user wants to set this
          //        card as favourite, we pass true anyway since it's the
          //        default.
          true
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

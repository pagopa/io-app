/**
 * This screen presents a summary on the credit card after the user
 * inserted the data required to save a new card
 */
import { AmountInEuroCents, RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Content } from "native-base";
import * as React from "react";
import { View, Alert, SafeAreaView, StyleSheet } from "react-native";
import { connect } from "react-redux";

import { PaymentRequestsGetResponse } from "../../../definitions/backend/PaymentRequestsGetResponse";
import { TypeEnum } from "../../../definitions/pagopa/Wallet";
import image from "../../../img/wallet/errors/payment-unavailable-icon.png";
import { InfoBox } from "../../components/box/InfoBox";
import { HSpacer, VSpacer } from "../../components/core/spacer/Spacer";
import { H1 } from "../../components/core/typography/H1";
import { H4 } from "../../components/core/typography/H4";
import { H5 } from "../../components/core/typography/H5";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import { renderInfoRasterImage } from "../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import Switch from "../../components/ui/Switch";
import CardComponent from "../../components/wallet/card/CardComponent";
import { PayWebViewModal } from "../../components/wallet/PayWebViewModal";
import { pagoPaApiUrlPrefix, pagoPaApiUrlPrefixTest } from "../../config";
import { confirmButtonProps } from "../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { FooterStackButton } from "../../features/bonus/bonusVacanze/components/buttons/FooterStackButtons";

import { LoadingErrorComponent } from "../../features/bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import {
  isError,
  isLoading as isRemoteLoading,
  isReady
} from "../../features/bonus/bpd/model/RemoteValue";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../navigation/params/WalletParamsList";
import {
  navigateToAddCreditCardOutcomeCode,
  navigateToPaymentPickPaymentMethodScreen,
  navigateToWalletHome
} from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { addCreditCardOutcomeCode } from "../../store/actions/wallet/outcomeCode";
import {
  addCreditCardWebViewEnd,
  AddCreditCardWebViewEndReason,
  addWalletCreditCardInit,
  creditCardPaymentNavigationUrls,
  fetchWalletsRequestWithExpBackoff,
  runStartOrResumeAddCreditCardSaga
} from "../../store/actions/wallet/wallets";
import { isPagoPATestEnabledSelector } from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";
import { pmSessionTokenSelector } from "../../store/reducers/wallet/payment";
import { getAllWallets } from "../../store/reducers/wallet/wallets";
import customVariables from "../../theme/variables";
import { CreditCard, Wallet } from "../../types/pagopa";
import { getLocalePrimaryWithFallback } from "../../utils/locale";
import { getLookUpIdPO } from "../../utils/pmLookUpId";
import { showToast } from "../../utils/showToast";
import { dispatchPickPspOrConfirm } from "./payment/common";

export type ConfirmCardDetailsScreenNavigationParams = Readonly<{
  creditCard: CreditCard;
  inPayment: O.Option<{
    rptId: RptId;
    initialAmount: AmountInEuroCents;
    verifica: PaymentRequestsGetResponse;
    idPayment: string;
  }>;
  keyFrom?: string;
}>;

type ReduxMergedProps = Readonly<{
  onRetry?: () => void;
}>;

type OwnProps = IOStackNavigationRouteProps<
  WalletParamsList,
  "WALLET_CONFIRM_CARD_DETAILS"
>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  ReduxMergedProps &
  OwnProps;

type State = Readonly<{
  setAsFavourite: boolean;
}>;

const styles = StyleSheet.create({
  paddedLR: {
    paddingLeft: customVariables.contentPadding,
    paddingRight: customVariables.contentPadding
  },
  preferredMethodContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.saveCard.contextualHelpTitle",
  body: "wallet.saveCard.contextualHelpContent"
};

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
    const creditCard = this.props.route.params.creditCard;
    const isInPayment = O.isSome(this.props.route.params.inPayment);

    // WebView parameters
    const payUrlSuffix = "/v3/webview/transactions/cc/verify";
    const webViewExitPathName = "/v3/webview/logout/bye";
    const webViewOutcomeParamName = "outcome";

    const urlPrefix = this.props.isPagoPATestEnabled
      ? pagoPaApiUrlPrefixTest
      : pagoPaApiUrlPrefix;

    // the user press back during the pay web view challenge
    const handlePayWebviewGoBack = () => {
      Alert.alert(I18n.t("wallet.abortWebView.title"), "", [
        {
          text: I18n.t("wallet.abortWebView.confirm"),
          onPress: () => {
            this.props.dispatchEndAddCreditCardWebview("USER_ABORT");
            this.props.onCancel();
          },
          style: "cancel"
        },
        {
          text: I18n.t("wallet.abortWebView.cancel")
        }
      ]);
    };

    const payWebViewPayload =
      isReady(this.props.pmSessionToken) &&
      O.isSome(this.props.creditCardTempWallet) &&
      creditCard.securityCode
        ? {
            formData: {
              idWallet: this.props.creditCardTempWallet.value.idWallet,
              securityCode: creditCard.securityCode,
              sessionToken: this.props.pmSessionToken.value,
              language: getLocalePrimaryWithFallback()
            },
            crediCardTempWallet: this.props.creditCardTempWallet.value
          }
        : undefined;

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
        : I18n.t("global.buttons.continue"),
      testID: "saveOrContinueButton"
    };

    const secondaryButtonProps = {
      block: true,
      bordered: true,
      onPress: this.goBack,
      title: I18n.t("global.buttons.back")
    };

    // shown when wallets pot is in error state
    const walletsInErrorContent = (
      <SafeAreaView style={IOStyles.flex}>
        <InfoScreenComponent
          image={renderInfoRasterImage(image)}
          title={I18n.t("wallet.saveCard.loadWalletsErrorTitle")}
          body={I18n.t("wallet.saveCard.loadWalletsErrorBody")}
        />
        <FooterStackButton
          buttons={[
            confirmButtonProps(() => {
              // load wallets and navigate to wallet home
              this.props.loadWallets();
              this.props.navigateToWalletHome();
            }, I18n.t("wallet.refreshWallet"))
          ]}
        />
      </SafeAreaView>
    );

    // shown when any steps of credit card onboarding are in error state
    const creditCardErrorContent = (
      <LoadingErrorComponent
        isLoading={false}
        loadingCaption={""}
        errorSubText={I18n.t("wallet.saveCard.temporarySubError")}
        errorText={O.getOrElse(() => "")(this.props.error)}
        onRetry={this.props.onRetry ?? constNull}
        onAbort={this.goBack}
      />
    );
    // this component is shown only in error case (wallet || credit card onboarding)
    const errorContent = this.props.areWalletsInError
      ? walletsInErrorContent
      : creditCardErrorContent;

    const formData = pipe(
      payWebViewPayload?.formData,
      O.fromNullable,
      O.map(payload => ({
        ...payload,
        ...getLookUpIdPO()
      })),
      O.getOrElse(() => ({}))
    );

    const noErrorContent = (
      <SafeAreaView style={IOStyles.flex}>
        <Content noPadded={true} style={styles.paddedLR}>
          <H1>{I18n.t("wallet.saveCard.title")}</H1>
          <H4 weight={"Regular"}>{I18n.t("wallet.saveCard.subtitle")}</H4>
          <VSpacer size={16} />
          <CardComponent
            wallet={wallet}
            type={"Full"}
            extraSpace={true}
            hideMenu={true}
            hideFavoriteIcon={true}
          />
          <VSpacer size={16} />
          <InfoBox alignedCentral={true} iconSize={24} iconColor="bluegreyDark">
            <H5 weight={"Regular"}>{I18n.t("wallet.saveCard.notice")}</H5>
          </InfoBox>
          <VSpacer size={24} />
          <View style={styles.preferredMethodContainer}>
            <View style={IOStyles.flex}>
              <H4 weight={"SemiBold"} color={"bluegreyDark"}>
                {I18n.t("wallet.saveCard.infoTitle")}
              </H4>
              <H5 weight={"Regular"} color={"bluegrey"}>
                {I18n.t("wallet.saveCard.info")}
              </H5>
            </View>
            <HSpacer size={16} />
            <View style={{ paddingTop: 7 }}>
              <Switch
                value={this.state.setAsFavourite}
                onValueChange={this.onSetFavouriteValueChange}
              />
            </View>
          </View>
        </Content>

        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={secondaryButtonProps}
          rightButton={primaryButtonProps}
        />

        {/*
         * When the first step is finished (creditCardAddWallet === O.some) show the webview
         * for the payment component.
         */}
        {payWebViewPayload && (
          <PayWebViewModal
            postUri={urlPrefix + payUrlSuffix}
            formData={formData}
            finishPathName={webViewExitPathName}
            onFinish={(maybeCode, navigationUrls) => {
              this.props.dispatchCreditCardPaymentNavigationUrls(
                navigationUrls
              );
              this.props.storeCreditCardOutcome(maybeCode);
              this.props.goToAddCreditCardOutcomeCode(
                payWebViewPayload.crediCardTempWallet
              );
              this.props.dispatchEndAddCreditCardWebview("EXIT_PATH");
            }}
            outcomeQueryparamName={webViewOutcomeParamName}
            onGoBack={handlePayWebviewGoBack}
            modalHeaderTitle={I18n.t("wallet.challenge3ds.header")}
          />
        )}
      </SafeAreaView>
    );
    const error = O.isSome(this.props.error) || this.props.areWalletsInError;
    return (
      <BaseScreenComponent
        goBack={true}
        headerTitle={
          isInPayment
            ? I18n.t("wallet.saveCardInPayment.header")
            : I18n.t("wallet.saveCard.header")
        }
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["wallet_methods"]}
      >
        {/* error could include credit card errors (add wallet (step-1))
            and load wallets error too
        */}
        {error ? errorContent : noErrorContent}
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const { creditCardAddWallet, walletById } = state.wallet.wallets;

  const { pspsV2 } = state.wallet.payment;
  const pmSessionToken = pmSessionTokenSelector(state);
  const isLoading =
    isRemoteLoading(pmSessionToken) ||
    pot.isLoading(creditCardAddWallet) ||
    pot.isLoading(walletById) ||
    isRemoteLoading(pspsV2.psps);

  // considering wallet error only when the first step is completed and not in error
  const areWalletsInError =
    pot.isError(walletById) && pot.isSome(creditCardAddWallet);

  const error =
    (pot.isError(creditCardAddWallet) &&
      creditCardAddWallet.error.kind !== "ALREADY_EXISTS") ||
    isError(pspsV2.psps)
      ? O.some(I18n.t("wallet.saveCard.temporaryError"))
      : O.none;

  // Props needed to create the form for the payment web view
  const allWallets = getAllWallets(state);
  const creditCardTempWallet: O.Option<Wallet> = pipe(
    pot.toOption(allWallets.creditCardAddWallet),
    O.map(c => c.data)
  );

  return {
    isLoading,
    error,
    areWalletsInError,
    loadingOpacity: 0.98,
    loadingCaption: I18n.t("wallet.saveCard.loadingAlert"),
    creditCardTempWallet,
    pmSessionToken,
    isPagoPATestEnabled: isPagoPATestEnabledSelector(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => {
  const navigateToNextScreen = (maybeWallet: O.Option<Wallet>) => {
    const inPayment = props.route.params.inPayment;
    if (O.isSome(inPayment)) {
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

          navigateToPaymentPickPaymentMethodScreen({
            rptId,
            initialAmount,
            verifica,
            idPayment
          });
        }
      );
    } else {
      navigateToWalletHome({
        newMethodAdded: O.isSome(maybeWallet),
        keyFrom: props.route.params.keyFrom
      });
    }
  };
  return {
    navigateToWalletHome: () => navigateToWalletHome(),
    loadWallets: () => dispatch(fetchWalletsRequestWithExpBackoff()),
    addWalletCreditCardInit: () => dispatch(addWalletCreditCardInit()),
    runStartOrResumeAddCreditCardSaga: (
      creditCard: CreditCard,
      setAsFavorite: boolean
    ) =>
      dispatch(
        runStartOrResumeAddCreditCardSaga({
          creditCard,
          setAsFavorite,
          onSuccess: addedWallet => {
            navigateToNextScreen(O.some(addedWallet));
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
            navigateToNextScreen(O.none);
          }
        })
      ),
    onCancel: () => props.navigation.goBack(),
    storeCreditCardOutcome: (outcomeCode: O.Option<string>) =>
      dispatch(addCreditCardOutcomeCode(outcomeCode)),
    goToAddCreditCardOutcomeCode: (creditCard: Wallet) =>
      navigateToAddCreditCardOutcomeCode({ selectedWallet: creditCard }),
    dispatchEndAddCreditCardWebview: (
      reason: AddCreditCardWebViewEndReason
    ) => {
      dispatch(addCreditCardWebViewEnd(reason));
    },
    dispatchCreditCardPaymentNavigationUrls: (
      navigationUrls: ReadonlyArray<string>
    ) => {
      dispatch(creditCardPaymentNavigationUrls(navigationUrls));
    }
  };
};

const mergeProps = (
  stateProps: ReturnType<typeof mapStateToProps>,
  dispatchProps: ReturnType<typeof mapDispatchToProps>,
  ownProps: OwnProps
) => {
  const maybeError = stateProps.error;
  const isRetriableError =
    O.isNone(maybeError) || maybeError.value !== "ALREADY_EXISTS";
  const onRetry = isRetriableError
    ? () => {
        dispatchProps.runStartOrResumeAddCreditCardSaga(
          ownProps.route.params.creditCard,
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
)(withLoadingSpinner(ConfirmCardDetailsScreen));

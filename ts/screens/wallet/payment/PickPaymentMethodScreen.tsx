/**
 * This screen allows the user to select the payment method for a selected transaction
 */
import { some } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-pagopa-commons/lib/pagopa";
import * as pot from "italia-ts-commons/lib/pot";
import { Content, View } from "native-base";
import * as React from "react";
import { getMonoid } from "fp-ts/lib/Array";
import { FlatList, SafeAreaView } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { ScrollView } from "react-native-gesture-handler";
import { convertWalletV2toWalletV1 } from "../../../utils/walletv2";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import {
  navigateToPaymentTransactionSummaryScreen,
  navigateToWalletAddPaymentMethod
} from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import { GlobalState } from "../../../store/reducers/types";
import { ImportoEuroCents } from "../../../../definitions/backend/ImportoEuroCents";
import {
  bancomatListVisibleInWalletSelector,
  bPayListVisibleInWalletSelector,
  creditCardListVisibleInWalletSelector,
  satispayListVisibleInWalletSelector
} from "../../../store/reducers/wallet/wallets";
import { PaymentMethod, Wallet } from "../../../types/pagopa";
import { showToast } from "../../../utils/showToast";
import { canMethodPay } from "../../../utils/paymentMethodCapabilities";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { H1 } from "../../../components/core/typography/H1";
import { H4 } from "../../../components/core/typography/H4";
import { profileNameSurnameSelector } from "../../../store/reducers/profile";
import PickNotAvailablePaymentMethodListItem from "../../../components/wallet/payment/PickNotAvailablePaymentMethodListItem";
import PickAvailablePaymentMethodListItem from "../../../components/wallet/payment/PickAvailablePaymentMethodListItem";
import { dispatchPickPspOrConfirm } from "./common";

type NavigationParams = Readonly<{
  rptId: RptId;
  initialAmount: AmountInEuroCents;
  verifica: PaymentRequestsGetResponse;
  idPayment: string;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  OwnProps;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.payWith.contextualHelpTitle",
  body: "wallet.payWith.contextualHelpContent"
};

const amexPaymentTreshold = 100000; // Eurocents

const renderFooterButtons = (onCancel: () => void, onContinue: () => void) => (
  <FooterWithButtons
    type={"TwoButtonsInlineThird"}
    leftButton={cancelButtonProps(onCancel, I18n.t("global.buttons.cancel"))}
    rightButton={confirmButtonProps(
      onContinue,
      I18n.t("wallet.newPaymentMethod.addButton")
    )}
  />
);

const PickPaymentMethodScreen: React.FunctionComponent<Props> = (
  props: Props
) => {
  const verifica: PaymentRequestsGetResponse = props.navigation.getParam(
    "verifica"
  );

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("wallet.payWith.header")}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["wallet_methods"]}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView style={IOStyles.flex}>
          <Content>
            <H1>{"Con quale metodo vuoi pagare?"}</H1>
            <View spacer={true} />
            <H4 weight={"Regular"} color={"bluegreyDark"}>
              {props.payableWallets.length > 0
                ? "Seleziona un metodo dal tuo Portafoglio, oppure aggiungine uno nuovo."
                : I18n.t("wallet.payWith.noWallets.text")}
            </H4>
            <View spacer={true} />
            <FlatList
              removeClippedSubviews={false}
              data={props.payableWallets(verifica.importoSingoloVersamento)}
              keyExtractor={item => item.idWallet.toString()}
              ListFooterComponent={<View spacer />}
              renderItem={i => (
                <PickAvailablePaymentMethodListItem
                  isFirst={i.index === 0}
                  paymentMethod={i.item}
                  onPress={() =>
                    props.navigateToConfirmOrPickPsp(
                      // Since only credit cards are now accepted method we manage only this case
                      // TODO: if payment methods different from credit card should be accepted manage every case
                      convertWalletV2toWalletV1(i.item)
                    )
                  }
                />
              )}
            />
            <View spacer={true} />
            <H4 color={"bluegreyDark"}>Metodi non compatibili</H4>
            <View spacer={true} />
            <FlatList
              removeClippedSubviews={false}
              data={props.notPayableWallets(verifica.importoSingoloVersamento)}
              keyExtractor={item => item.idWallet.toString()}
              ListFooterComponent={<View spacer />}
              renderItem={i => (
                <PickNotAvailablePaymentMethodListItem
                  isFirst={i.index === 0}
                  paymentMethod={i.item}
                />
              )}
            />
          </Content>
        </ScrollView>
        {renderFooterButtons(
          props.navigateToTransactionSummary,
          props.navigateToAddPaymentMethod
        )}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => {
  const potVisibleCreditCard = creditCardListVisibleInWalletSelector(state);
  const potVisibleBancomat = bancomatListVisibleInWalletSelector(state);
  const potVisibleBPay = bPayListVisibleInWalletSelector(state);
  const potVisibleSatispay = satispayListVisibleInWalletSelector(state);
  const potPsps = state.wallet.payment.psps;
  const isLoading =
    pot.isLoading(potVisibleCreditCard) || pot.isLoading(potPsps);

  const visibleCreditCard = pot.getOrElse(potVisibleCreditCard, []).map(c => c);
  const visibleBancomat = pot.getOrElse(potVisibleBancomat, []).map(b => b);
  const visibleBPay = pot.getOrElse(potVisibleBPay, []).map(bP => bP);
  const visibleSatispay = pot.getOrElse(potVisibleSatispay, []).map(s => s);

  const M = getMonoid<PaymentMethod>();
  const visibleWallets = M.concat(visibleCreditCard, visibleBancomat)
    .concat(visibleBPay)
    .concat(visibleSatispay);

  const exceedsAmexLimit = (amount: ImportoEuroCents) =>
    amount >= amexPaymentTreshold;
  return {
    // Considering that the creditCardListVisibleInWalletSelector return
    // all the visible credit card we need to filter them in order to extract
    // only the cards that can pay on IO (eg. Maestro is a not valid credit card).
    // Furthermore we must filter also the AMEX card if the amount of the payment
    // is greater or equal to amexPaymentTreshold
    payableWallets: (amount: ImportoEuroCents) =>
      visibleWallets.filter(
        vPW =>
          canMethodPay(vPW) &&
          ((vPW.kind === "CreditCard" && vPW.info?.brand !== "AMEX") ||
            !exceedsAmexLimit(amount))
      ),
    notPayableWallets: (amount: ImportoEuroCents) =>
      visibleWallets.filter(
        vPW =>
          !canMethodPay(vPW) ||
          (vPW.kind === "CreditCard" &&
            vPW.info?.brand === "AMEX" &&
            exceedsAmexLimit(amount))
      ),
    isLoading,
    nameSurname: profileNameSurnameSelector(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => ({
  navigateToTransactionSummary: () =>
    dispatch(
      navigateToPaymentTransactionSummaryScreen({
        rptId: props.navigation.getParam("rptId"),
        initialAmount: props.navigation.getParam("initialAmount")
      })
    ),
  navigateToConfirmOrPickPsp: (wallet: Wallet) => {
    dispatchPickPspOrConfirm(dispatch)(
      props.navigation.getParam("rptId"),
      props.navigation.getParam("initialAmount"),
      props.navigation.getParam("verifica"),
      props.navigation.getParam("idPayment"),
      some(wallet),
      failureReason => {
        // selecting the payment method has failed, show a toast and stay in
        // this screen

        if (failureReason === "FETCH_PSPS_FAILURE") {
          // fetching the PSPs for the payment has failed
          showToast(I18n.t("wallet.payWith.fetchPspFailure"), "warning");
        } else if (failureReason === "NO_PSPS_AVAILABLE") {
          // this wallet cannot be used for this payment
          // TODO: perhaps we can temporarily hide the selected wallet from
          //       the list of available wallets
          showToast(I18n.t("wallet.payWith.noPspsAvailable"), "danger");
        }
      }
    );
  },
  navigateToAddPaymentMethod: () =>
    dispatch(
      navigateToWalletAddPaymentMethod({
        inPayment: some({
          rptId: props.navigation.getParam("rptId"),
          initialAmount: props.navigation.getParam("initialAmount"),
          verifica: props.navigation.getParam("verifica"),
          idPayment: props.navigation.getParam("idPayment")
        })
      })
    )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLoadingSpinner(PickPaymentMethodScreen));

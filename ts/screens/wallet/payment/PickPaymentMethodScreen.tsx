/**
 * This screen allows the user to select the payment method for a selected transaction
 */
import { Divider, VSpacer } from "@pagopa/io-app-design-system";
import { AmountInEuroCents, RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Route, useNavigation, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { Content } from "native-base";
import * as React from "react";
import { FlatList, SafeAreaView } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { connect } from "react-redux";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";

import {
  isLoading as isLoadingRemote,
  isLoading as isRemoteLoading
} from "../../../common/model/RemoteValue";
import { IOToast } from "../../../components/Toast";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../components/buttons/ButtonConfigurations";
import { H1 } from "../../../components/core/typography/H1";
import { H4 } from "../../../components/core/typography/H4";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import PickAvailablePaymentMethodListItem from "../../../components/wallet/payment/PickAvailablePaymentMethodListItem";
import PickNotAvailablePaymentMethodListItem from "../../../components/wallet/payment/PickNotAvailablePaymentMethodListItem";
import PaymentStatusSwitch from "../../../features/wallet/component/features/PaymentStatusSwitch";
import I18n from "../../../i18n";
import {
  IOStackNavigationProp,
  IOStackNavigationRouteProps
} from "../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../navigation/params/WalletParamsList";
import {
  navigateBack,
  navigateToWalletAddPaymentMethod
} from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import {
  bancomatPayConfigSelector,
  isPaypalEnabledSelector
} from "../../../store/reducers/backendStatus";
import { profileNameSurnameSelector } from "../../../store/reducers/profile";
import { GlobalState } from "../../../store/reducers/types";
import { pspV2ListSelector } from "../../../store/reducers/wallet/payment";
import {
  bPayListVisibleInWalletSelector,
  bancomatListVisibleInWalletSelector,
  creditCardListVisibleInWalletSelector,
  paypalListSelector
} from "../../../store/reducers/wallet/wallets";
import { PaymentMethod, Wallet } from "../../../types/pagopa";
import {
  hasPaymentFeature,
  isDisabledToPay,
  isEnabledToPay
} from "../../../utils/paymentMethodCapabilities";
import { convertWalletV2toWalletV1 } from "../../../utils/walletv2";
import { dispatchPickPspOrConfirm } from "./common";

export type PickPaymentMethodScreenNavigationParams = Readonly<{
  rptId: RptId;
  initialAmount: AmountInEuroCents;
  verifica: PaymentRequestsGetResponse;
  idPayment: string;
}>;

type OwnProps = IOStackNavigationRouteProps<
  WalletParamsList,
  "PAYMENT_PICK_PAYMENT_METHOD"
>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  OwnProps;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.payWith.contextualHelpTitle",
  body: "wallet.payWith.contextualHelpContent"
};

const renderFooterButtons = (onCancel: () => void, onContinue: () => void) => (
  <FooterWithButtons
    type={"TwoButtonsInlineThird"}
    leftButton={cancelButtonProps(onCancel, I18n.t("global.buttons.back"))}
    rightButton={confirmButtonProps(
      onContinue,
      I18n.t("wallet.newPaymentMethod.addButton"),
      undefined,
      "walletAddNewPaymentMethodTestId"
    )}
  />
);

const PickPaymentMethodScreen: React.FunctionComponent<Props> = (
  props: Props
) => {
  const { methodsCanPay, methodsCantPay, methodsCanPayButDisabled } = props;

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
            <H1>{I18n.t("wallet.payWith.pickPaymentMethod.title")}</H1>
            <VSpacer size={16} />
            {methodsCanPay.length > 0 ? (
              <>
                <H4 weight={"Regular"} color={"bluegreyDark"}>
                  {I18n.t("wallet.payWith.text")}
                </H4>
                <FlatList
                  testID={"availablePaymentMethodList"}
                  removeClippedSubviews={false}
                  data={methodsCanPay}
                  ItemSeparatorComponent={() => <Divider />}
                  keyExtractor={item => item.idWallet.toString()}
                  ListFooterComponent={<VSpacer size={16} />}
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
                <VSpacer size={16} />
              </>
            ) : (
              <H4
                weight={"Regular"}
                color={"bluegreyDark"}
                testID={"noWallets"}
              >
                {I18n.t("wallet.payWith.noWallets.text")}
              </H4>
            )}

            {methodsCanPayButDisabled.length > 0 && (
              <>
                <VSpacer size={16} />
                <H4 color={"bluegreyDark"}>
                  {I18n.t("wallet.payWith.pickPaymentMethod.disabled.title")}
                </H4>
                <VSpacer size={16} />
                <FlatList
                  testID={"DisabledPaymentMethodList"}
                  removeClippedSubviews={false}
                  data={methodsCanPayButDisabled}
                  ItemSeparatorComponent={() => <Divider />}
                  keyExtractor={item => `disabled_payment_${item.idWallet}`}
                  ListFooterComponent={<VSpacer size={16} />}
                  renderItem={i => (
                    <PickAvailablePaymentMethodListItem
                      rightElement={
                        <PaymentStatusSwitch paymentMethod={i.item} />
                      }
                      isFirst={i.index === 0}
                      paymentMethod={i.item}
                      onPress={undefined}
                    />
                  )}
                />
              </>
            )}

            {methodsCantPay.length > 0 && (
              <>
                <VSpacer size={16} />
                <H4 color={"bluegreyDark"}>
                  {I18n.t(
                    "wallet.payWith.pickPaymentMethod.notAvailable.title"
                  )}
                </H4>
                <VSpacer size={16} />
                <FlatList
                  testID={"notPayablePaymentMethodList"}
                  removeClippedSubviews={false}
                  data={methodsCantPay}
                  ItemSeparatorComponent={() => <Divider />}
                  keyExtractor={item => item.idWallet.toString()}
                  ListFooterComponent={<VSpacer size={16} />}
                  renderItem={i => (
                    <PickNotAvailablePaymentMethodListItem
                      isFirst={i.index === 0}
                      paymentMethod={i.item}
                    />
                  )}
                />
              </>
            )}
          </Content>
        </ScrollView>
        {renderFooterButtons(props.goBack, props.navigateToAddPaymentMethod)}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => {
  const potVisibleCreditCard = creditCardListVisibleInWalletSelector(state);
  const potVisiblePaypal = isPaypalEnabledSelector(state)
    ? paypalListSelector(state)
    : pot.none;
  const potVisibleBancomat = bancomatListVisibleInWalletSelector(state);
  const potVisibleBPay = bancomatPayConfigSelector(state).payment
    ? bPayListVisibleInWalletSelector(state)
    : pot.none;
  const psps = state.wallet.payment.pspsV2.psps;
  const pspV2 = pspV2ListSelector(state);
  const isLoading =
    pot.isLoading(potVisibleCreditCard) ||
    isRemoteLoading(psps) ||
    isLoadingRemote(pspV2);

  const visibleWallets = [
    potVisibleCreditCard,
    potVisiblePaypal,
    potVisibleBancomat,
    potVisibleBPay
  ].reduce(
    (
      acc: ReadonlyArray<PaymentMethod>,
      curr: pot.Pot<ReadonlyArray<PaymentMethod>, unknown>
    ) => [...acc, ...pot.getOrElse(curr, [])],
    [] as ReadonlyArray<PaymentMethod>
  );
  return {
    methodsCanPay: visibleWallets.filter(isEnabledToPay),
    methodsCanPayButDisabled: visibleWallets.filter(isDisabledToPay),
    methodsCantPay: visibleWallets.filter(v => !hasPaymentFeature(v)),
    isLoading,
    nameSurname: profileNameSurnameSelector(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => ({
  goBack: () => navigateBack(),
  navigateToConfirmOrPickPsp: (wallet: Wallet) => {
    dispatchPickPspOrConfirm(dispatch)(
      props.route.params.rptId,
      props.route.params.initialAmount,
      props.route.params.verifica,
      props.route.params.idPayment,
      O.some(wallet),
      failureReason => {
        // selecting the payment method has failed, show a toast and stay in
        // this screen

        if (failureReason === "FETCH_PSPS_FAILURE") {
          // fetching the PSPs for the payment has failed
          IOToast.warning(I18n.t("wallet.payWith.fetchPspFailure"));
        } else if (failureReason === "NO_PSPS_AVAILABLE") {
          // this wallet cannot be used for this payment
          // TODO: perhaps we can temporarily hide the selected wallet from
          //       the list of available wallets
          IOToast.error(I18n.t("wallet.payWith.noPspsAvailable"));
        }
      }
    );
  },
  navigateToAddPaymentMethod: () =>
    navigateToWalletAddPaymentMethod({
      inPayment: O.some({
        rptId: props.route.params.rptId,
        initialAmount: props.route.params.initialAmount,
        verifica: props.route.params.verifica,
        idPayment: props.route.params.idPayment
      })
    })
});

const ConnectedPickPaymentMethodScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(withLoadingSpinner(PickPaymentMethodScreen));

const PickPaymentMethodScreenFC = () => {
  const navigation =
    useNavigation<
      IOStackNavigationProp<WalletParamsList, "PAYMENT_PICK_PAYMENT_METHOD">
    >();
  const route =
    useRoute<
      Route<
        "PAYMENT_PICK_PAYMENT_METHOD",
        PickPaymentMethodScreenNavigationParams
      >
    >();
  return (
    <ConnectedPickPaymentMethodScreen navigation={navigation} route={route} />
  );
};
export default PickPaymentMethodScreenFC;

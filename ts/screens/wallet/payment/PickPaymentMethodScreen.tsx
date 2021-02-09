/**
 * This screen allows the user to select the payment method for a selected transaction
 */
import { some } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-pagopa-commons/lib/pagopa";
import * as pot from "italia-ts-commons/lib/pot";
import { Content, List, ListItem, Text, View } from "native-base";
import * as React from "react";
import {
  Image,
  FlatList,
  ListRenderItemInfo,
  SafeAreaView,
  StyleSheet
} from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../../components/screens/EdgeBorderComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import CardComponent from "../../../components/wallet/card/CardComponent";
import PaymentBannerComponent from "../../../components/wallet/PaymentBannerComponent";
import { InfoBox } from "../../../components/box/InfoBox";
import { IOColors } from "../../../components/core/variables/IOColors";
import { Label } from "../../../components/core/typography/Label";

import I18n from "../../../i18n";
import {
  navigateToPaymentTransactionSummaryScreen,
  navigateToWalletAddPaymentMethod
} from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import { GlobalState } from "../../../store/reducers/types";
import { creditCardListVisibleInWalletSelector } from "../../../store/reducers/wallet/wallets";
import variables from "../../../theme/variables";
import { PaymentMethod, Wallet } from "../../../types/pagopa";
import { showToast } from "../../../utils/showToast";
import { dispatchPickPspOrConfirm } from "./common";
import { canMethodPay } from "../../../utils/paymentMethodCapabilities";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { H1 } from "../../../components/core/typography/H1";
import { H4 } from "../../../components/core/typography/H4";
import { getCardIconFromBrandLogo } from "../../../components/wallet/card/Logo";
import { H5 } from "../../../components/core/typography/H5";
import { localeDateFormat } from "../../../utils/locale";
import IconFont from "../../../components/ui/IconFont";
import { getMonoid } from "fp-ts/lib/Array";

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

const styles = StyleSheet.create({
  paddedLR: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  },
  infoBoxContainer: { padding: 20, backgroundColor: IOColors.orange },
  cardLogo: {
    height: 26,
    width: 41
  },
  paymentMethodInfo: {
    paddingLeft: 15
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.payWith.contextualHelpTitle",
  body: "wallet.payWith.contextualHelpContent"
};

const amexPaymentWarningTreshold = 100000; // Eurocents
const getExpireDate = (fullYear?: string, month?: string): Date | undefined => {
  if (!fullYear || !month) {
    return undefined;
  }
  const year = parseInt(fullYear, 10);
  const indexedMonth = parseInt(month, 10);
  if (isNaN(year) || isNaN(indexedMonth)) {
    return undefined;
  }
  return new Date(year, indexedMonth - 1);
};

const extractInfoFromPaymentMethod = (paymentMethod: PaymentMethod) => {
  switch (paymentMethod.kind) {
    case "CreditCard":
      const expiryDate = getExpireDate(
        paymentMethod.info.expireYear,
        paymentMethod.info.expireMonth
      );
      if (expiryDate) {
        return localeDateFormat(
          expiryDate,
          I18n.t("global.dateFormats.numericMonthYear")
        );
      }
      return "";
    case "Bancomat":
    case "BPay":
    case "Satispay":
      return "";
  }
};

const renderListItem = (
  paymentMethodItem: ListRenderItemInfo<PaymentMethod>
) => {
  const brandLogo = getCardIconFromBrandLogo(paymentMethodItem.item.info);
  const paymentMethodInfo = extractInfoFromPaymentMethod(
    paymentMethodItem.item
  );
  return (
    <ListItem first={paymentMethodItem.index === 0}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          flex: 1
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={brandLogo}
            style={styles.cardLogo}
            testID={"cardImage"}
          />
          <View spacer={true} />
          <View style={styles.paymentMethodInfo}>
            <H4 weight={"SemiBold"} color={"bluegreyDark"}>
              {paymentMethodItem.item.caption}
            </H4>
            <H5 weight={"Regular"} color={"bluegreyDark"}>
              {paymentMethodInfo}
            </H5>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {paymentMethodItem.item.favourite && (
            <IconFont name={"io-filled-star"} color={IOColors.blue} size={24} />
          )}
          <IconFont name={"io-right"} color={IOColors.blue} size={24} />
        </View>
      </View>
    </ListItem>
  );
};

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

const PickPaymentMethodScreen2: React.FunctionComponent<Props> = (
  props: Props
) => (
  <BaseScreenComponent
    goBack={true}
    headerTitle={I18n.t("wallet.payWith.header")}
    contextualHelpMarkdown={contextualHelpMarkdown}
    faqCategories={["wallet_methods"]}
  >
    <SafeAreaView style={IOStyles.flex}>
      <Content>
        <H1>{"Con quale metodo vuoi pagare?"}</H1>
        <View spacer={true} />
        <H4 weight={"Regular"} color={"bluegreyDark"}>
          {props.payableCards.length > 0
            ? "Seleziona un metodo dal tuo Portafoglio, oppure aggiungine uno nuovo."
            : I18n.t("wallet.payWith.noWallets.text")}
        </H4>
        <View spacer={true} />
        <FlatList
          removeClippedSubviews={false}
          data={props.payableCards}
          keyExtractor={item => item.idWallet.toString()}
          ListFooterComponent={<View spacer />}
          renderItem={i => renderListItem(i)}
        />
        <View spacer={true} />
        <H4 color={"bluegreyDark"}>Metodi non compatibili</H4>
        <View spacer={true} />
        <FlatList
          removeClippedSubviews={false}
          data={props.payableCards}
          keyExtractor={item => item.idWallet.toString()}
          ListFooterComponent={<View spacer />}
          renderItem={i => renderListItem(i)}
        />
      </Content>
      {renderFooterButtons(
        props.navigateToTransactionSummary,
        props.navigateToAddPaymentMethod
      )}
    </SafeAreaView>
  </BaseScreenComponent>
);

class PickPaymentMethodScreen extends React.Component<Props> {
  public render(): React.ReactNode {
    const verifica: PaymentRequestsGetResponse = this.props.navigation.getParam(
      "verifica"
    );
    const paymentReason = verifica.causaleVersamento; // this could be empty as per pagoPA definition
    const { payableCards: wallets } = this.props;

    const primaryButtonProps = {
      block: true,
      onPress: this.props.navigateToAddPaymentMethod,
      title: I18n.t("wallet.newPaymentMethod.addButton")
    };

    const secondaryButtonProps = {
      block: true,
      bordered: true,
      onPress: this.props.navigateToTransactionSummary,
      title: I18n.t("global.buttons.cancel")
    };

    return (
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("wallet.payWith.header")}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["wallet_methods"]}
      >
        <Content noPadded={true} bounces={false}>
          <PaymentBannerComponent
            paymentReason={paymentReason}
            currentAmount={verifica.importoSingoloVersamento}
          />

          <View style={styles.paddedLR}>
            <View spacer={true} />
            <Text>
              {I18n.t(
                wallets.length > 0
                  ? "wallet.payWith.text"
                  : "wallet.payWith.noWallets.text"
              )}
            </Text>
            <List
              keyExtractor={item => `${item.idWallet}`}
              removeClippedSubviews={false}
              dataArray={wallets} // eslint-disable-line
              renderRow={(item): React.ReactElement<any> => (
                <CardComponent
                  type="Picking"
                  wallet={item}
                  mainAction={this.props.navigateToConfirmOrPickPsp}
                />
              )}
            />
            {wallets.length > 0 && <EdgeBorderComponent />}
          </View>
        </Content>

        <View spacer={true} />

        {wallets.some(myWallet => myWallet.info?.brand === "AMEX") &&
          verifica.importoSingoloVersamento >= amexPaymentWarningTreshold && (
            <View style={styles.infoBoxContainer}>
              <InfoBox alignedCentral={true} iconColor={IOColors.white}>
                <Label weight={"Regular"} color="white">
                  {I18n.t("wallet.alert.amex")}
                </Label>
              </InfoBox>
            </View>
          )}
        <FooterWithButtons
          type="TwoButtonsInlineThird"
          leftButton={secondaryButtonProps}
          rightButton={primaryButtonProps}
        />
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const potVisibleCreditCards = creditCardListVisibleInWalletSelector(state);
  const potPsps = state.wallet.payment.psps;
  const isLoading =
    pot.isLoading(potVisibleCreditCards) || pot.isLoading(potPsps);

  const notPayableCreditCard = pot
    .getOrElse(potVisibleCreditCards, [])
    .filter(cc => !canMethodPay(cc));

  // EXAMPLE CONCAT ARRAY
  // const payableCC = pot
  //   .getOrElse(potVisibleCreditCards, [])
  //   .filter(cc => canMethodPay(cc));
  // const M = getMonoid<PaymentMethod>();
  // const allCards = M.concat(notPayableCreditCard, payableCC);
  return {
    // Considering that the creditCardListVisibleInWalletSelector return
    // all the visible credit card we need to filter them in order to extract
    // only the cards that can pay on IO (eg. Maestro is a not valid credit card)
    payableCards: pot
      .getOrElse(potVisibleCreditCards, [])
      .filter(cc => canMethodPay(cc)),
    isLoading
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
)(withLoadingSpinner(PickPaymentMethodScreen2));

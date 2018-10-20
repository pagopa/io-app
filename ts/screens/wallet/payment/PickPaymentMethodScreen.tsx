/**
 * This screen allows the user to select the payment method for a selected transaction
 * TODO: "back" & "cancel" behavior to be implemented @https://www.pivotaltracker.com/story/show/159229087
 */
import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import {
  Body,
  Container,
  Content,
  H1,
  Left,
  List,
  Right,
  Text,
  View
} from "native-base";
import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import { some } from "fp-ts/lib/Option";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import GoBackButton from "../../../components/GoBackButton";
import { InstabugButtons } from "../../../components/InstabugButtons";
import { WalletStyles } from "../../../components/styles/wallet";
import AppHeader from "../../../components/ui/AppHeader";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import CardComponent from "../../../components/wallet/card/CardComponent";
import { LogoPosition } from "../../../components/wallet/card/Logo";
import PaymentBannerComponent from "../../../components/wallet/PaymentBannerComponent";
import I18n from "../../../i18n";
import {
  navigateToWalletAddPaymentMethod,
  navigateToWalletTransactionsScreen
} from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import {
  paymentRequestConfirmPaymentMethod,
  paymentRequestGoBack,
  paymentRequestTransactionSummaryFromBanner
} from "../../../store/actions/wallet/payment";
import { GlobalState } from "../../../store/reducers/types";
import { walletsSelector } from "../../../store/reducers/wallet/wallets";
import { Psp, Wallet } from "../../../types/pagopa";
import * as pot from "../../../types/pot";
import { AmountToImporto } from "../../../utils/amounts";

type NavigationParams = Readonly<{
  rptId: RptId;
  initialAmount: AmountInEuroCents;
  verifica: PaymentRequestsGetResponse;
  paymentId: string;
  psps: ReadonlyArray<Psp>;
}>;

type ReduxMappedStateProps = Readonly<{
  wallets: ReadonlyArray<Wallet>;
}>;

type ReduxMappedDispatchProps = Readonly<{
  confirmPaymentMethod: (wallet: Wallet, paymentId: string) => void;
  goBack: () => void;
  showSummary: () => void;
}>;

type Props = ReduxMappedStateProps &
  ReduxMappedDispatchProps &
  NavigationInjectedProps<NavigationParams>;

class PickPaymentMethodScreen extends React.Component<Props> {
  public render(): React.ReactNode {
    const rptId = this.props.navigation.getParam("rptId");
    const initialAmount = this.props.navigation.getParam("initialAmount");
    const verifica = this.props.navigation.getParam("verifica");
    const paymentId = this.props.navigation.getParam("paymentId");

    const paymentReason = verifica.causaleVersamento; // this could be empty as per pagoPA definition
    const currentAmount = AmountToImporto.encode(
      verifica.importoSingoloVersamento
    );
    const recipient = verifica.enteBeneficiario;

    const { wallets } = this.props;

    const primaryButtonProps = {
      block: true,
      onPress: () =>
        this.props.navigation.dispatch(
          navigateToWalletAddPaymentMethod({
            inPayment: some({
              rptId,
              initialAmount,
              verifica,
              paymentId
            })
          })
        ),
      title: I18n.t("wallet.newPaymentMethod.addButton")
    };

    const secondaryButtonProps = {
      block: true,
      cancel: true,
      onPress: this.props.showSummary,
      title: I18n.t("global.buttons.cancel")
    };

    const confirmPaymentMethod = (wallet: Wallet) =>
      this.props.confirmPaymentMethod(wallet, paymentId);

    return (
      <Container>
        <AppHeader>
          <Left>
            <GoBackButton onPress={this.props.goBack} />
          </Left>
          <Body>
            <Text>{I18n.t("wallet.payWith.header")}</Text>
          </Body>
          <Right>
            <InstabugButtons />
          </Right>
        </AppHeader>
        <Content noPadded={true}>
          <PaymentBannerComponent
            paymentReason={paymentReason}
            currentAmount={currentAmount}
            recipient={recipient}
          />

          <View style={WalletStyles.paddedLR}>
            <View spacer={true} />
            <H1>
              {I18n.t(
                wallets.length > 0
                  ? "wallet.payWith.title"
                  : "wallet.payWith.noWallets.title"
              )}
            </H1>
            <View spacer={true} />
            <Text>
              {I18n.t(
                wallets.length > 0
                  ? "wallet.payWith.text"
                  : "wallet.payWith.noWallets.text"
              )}
            </Text>
            <View spacer={true} />
            <List
              removeClippedSubviews={false}
              dataArray={wallets as any[]} // tslint:disable-line: readonly-array
              renderRow={(item): React.ReactElement<any> => (
                <CardComponent
                  wallet={item}
                  menu={false}
                  showFavoriteIcon={false}
                  lastUsage={false}
                  mainAction={confirmPaymentMethod}
                  logoPosition={LogoPosition.TOP}
                  navigateToWalletTransactions={(selectedWallet: Wallet) =>
                    this.props.navigation.dispatch(
                      navigateToWalletTransactionsScreen({ selectedWallet })
                    )
                  }
                />
              )}
            />
          </View>
        </Content>

        <FooterWithButtons
          leftButton={primaryButtonProps}
          rightButton={secondaryButtonProps}
        />
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => ({
  // FIXME: handle loading/error states
  wallets: pot.getOrElse(walletsSelector(state), [])
});

const mapDispatchToProps = (
  dispatch: Dispatch,
  props: NavigationInjectedProps<NavigationParams>
): ReduxMappedDispatchProps => ({
  confirmPaymentMethod: (wallet: Wallet, paymentId: string) =>
    dispatch(
      paymentRequestConfirmPaymentMethod({
        rptId: props.navigation.getParam("rptId"),
        initialAmount: props.navigation.getParam("initialAmount"),
        verifica: props.navigation.getParam("verifica"),
        wallet,
        paymentId
      })
    ),
  goBack: () => dispatch(paymentRequestGoBack()),
  showSummary: () => dispatch(paymentRequestTransactionSummaryFromBanner())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PickPaymentMethodScreen);

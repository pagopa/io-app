/**
 * This is the screen presented to the user
 * when they request adding a new payment method.
 * From here, they can select their payment method
 * of choice (although only credit cards will be allowed
 * initially).
 *
 * This screen allows also to add a new payment method after a transaction is identified
 * the header banner provide a summary on the transaction to perform.
 *
 * Keep in mind that the rest of the "add credit card" process
 * is handled @https://www.pivotaltracker.com/story/show/157838293
 */
import { Option } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import {
  Body,
  Button,
  Container,
  Content,
  H1,
  Left,
  Right,
  Text,
  View
} from "native-base";
import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import { PaymentRequestsGetResponse } from "../../../definitions/backend/PaymentRequestsGetResponse";
import GoBackButton from "../../components/GoBackButton";
import { InstabugButtons } from "../../components/InstabugButtons";
import { WalletStyles } from "../../components/styles/wallet";
import AppHeader from "../../components/ui/AppHeader";
import PaymentBannerComponent from "../../components/wallet/PaymentBannerComponent";
import PaymentMethodsList from "../../components/wallet/PaymentMethodsList";
import I18n from "../../i18n";
import { navigateToWalletAddCreditCard } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { AmountToImporto } from "../../utils/amounts";

type NavigationParams = Readonly<{
  inPayment: Option<{
    rptId: RptId;
    initialAmount: AmountInEuroCents;
    verifica: PaymentRequestsGetResponse;
    idPayment: string;
  }>;
}>;

type ReduxMappedDispatchProps = Readonly<{
  navigateToAddCreditCard: () => void;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = ReduxMappedDispatchProps & OwnProps;

class AddPaymentMethodScreen extends React.PureComponent<Props> {
  public render(): React.ReactNode {
    const inPayment = this.props.navigation.getParam("inPayment");
    return (
      <Container>
        <AppHeader>
          <Left>
            <GoBackButton />
          </Left>
          <Body>
            {inPayment.isSome() ? (
              <Text>{I18n.t("wallet.payWith.header")}</Text>
            ) : (
              <Text>{I18n.t("wallet.addPaymentMethodTitle")}</Text>
            )}
          </Body>
          <Right>
            <InstabugButtons />
          </Right>
        </AppHeader>
        {inPayment.isSome() ? (
          <Content noPadded={true}>
            <PaymentBannerComponent
              paymentReason={inPayment.value.verifica.causaleVersamento}
              currentAmount={AmountToImporto.encode(
                inPayment.value.verifica.importoSingoloVersamento
              )}
              recipient={inPayment.value.verifica.enteBeneficiario}
            />
            <View style={WalletStyles.paddedLR}>
              <View spacer={true} large={true} />
              <H1>{I18n.t("wallet.payWith.title")}</H1>
              <View spacer={true} />
              <PaymentMethodsList
                navigateToAddCreditCard={this.props.navigateToAddCreditCard}
              />
            </View>
          </Content>
        ) : (
          <Content>
            <PaymentMethodsList
              navigateToAddCreditCard={this.props.navigateToAddCreditCard}
            />
          </Content>
        )}
        <View footer={true}>
          <Button
            block={true}
            light={true}
            bordered={true}
            onPress={(): boolean => this.props.navigation.goBack()}
          >
            <Text>
              {inPayment.isSome()
                ? I18n.t("global.buttons.back")
                : I18n.t("global.buttons.cancel")}
            </Text>
          </Button>
        </View>
      </Container>
    );
  }
}

const mapDispatchToProps = (
  dispatch: Dispatch,
  props: OwnProps
): ReduxMappedDispatchProps => ({
  navigateToAddCreditCard: () =>
    dispatch(
      navigateToWalletAddCreditCard({
        inPayment: props.navigation.getParam("inPayment")
      })
    )
});

export default connect(
  undefined,
  mapDispatchToProps
)(AddPaymentMethodScreen);

/**
 * This screen shows the transaction details.
 * It should occur after the transaction identification by qr scanner or manual procedure.
 * TODO:
 * - integrate contextual help
 *    https://www.pivotaltracker.com/n/projects/2048617/stories/158108270
 * - check availability of displayed data. Define optional data and implement their rendering as preferred
 */

import {
  AmountInEuroCents,
  AmountInEuroCentsFromNumber,
  PaymentNoticeNumberFromString,
  RptId
} from "italia-ts-commons/lib/pagopa";
import {
  Body,
  Button,
  Container,
  Content,
  Left,
  Text,
  View
} from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { EnteBeneficiario } from "../../../../definitions/pagopa-proxy/EnteBeneficiario";
import AppHeader from "../../../components/ui/AppHeader";
import IconFont from "../../../components/ui/IconFont";
import Markdown from "../../../components/ui/Markdown";
import PaymentSummaryComponent from "../../../components/wallet/PaymentSummaryComponent";
import I18n from "../../../i18n";
import { Dispatch } from "../../../store/actions/types";
import { confirmSummary } from "../../../store/actions/wallet/payment";
import { GlobalState } from "../../../store/reducers/types";
import {
  currentAmountSelector,
  getInitialAmount,
  getRptId,
  paymentReasonSelector,
  paymentRecipientSelector
} from "../../../store/reducers/wallet/payment";
import variables from "../../../theme/variables";
import { UNKNOWN_RECIPIENT, UNKNOWN_RPTID, UNKNOWN_AMOUNT } from "../../../types/unknown";

type ReduxMappedStateProps = Readonly<{
  paymentRecipient: EnteBeneficiario;
  paymentReason: string;
  rptId: RptId;
  originalAmount: AmountInEuroCents;
  updatedAmount: AmountInEuroCents;
}>;

type ReduxMappedDispatchProps = Readonly<{
  confirmSummary: () => void;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReduxMappedStateProps & ReduxMappedDispatchProps;

const formatMdRecipient = (e: EnteBeneficiario): React.ReactNode => (
  <Markdown>
    {`
  **${I18n.t("wallet.firstTransactionSummary.entity")}**\n
  ${e.denominazioneBeneficiario} - ${e.denomUnitOperBeneficiario}\n
  ${e.indirizzoBeneficiario} n. ${e.civicoBeneficiario}\n
  ${e.capBeneficiario} ${e.localitaBeneficiario} (${e.provinciaBeneficiario})
  `}
  </Markdown>
);

const formatMdPaymentReason = (p: string): React.ReactNode => (
  <Markdown>
    {`
  **${I18n.t("wallet.firstTransactionSummary.object")}**\n
  ${p}
  `}
  </Markdown>
);

const formatMdInfoRpt = (r: RptId): React.ReactNode => (
  <Markdown>
    {`
  **IUV:** ${PaymentNoticeNumberFromString.encode(r.paymentNoticeNumber)}\n
  **Recipient Fiscal Code:** ${r.organizationFiscalCode}`}
  </Markdown>
);

class TransactionSummaryScreen extends React.Component<Props, never> {
  constructor(props: Props) {
    super(props);
  }

  private goBack() {
    this.props.navigation.goBack();
  }

  public render(): React.ReactNode {
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={() => this.goBack()}>
              <IconFont name="io-back" size={variables.iconSize3} />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("wallet.firstTransactionSummary.header")}</Text>
          </Body>
        </AppHeader>

        <Content noPadded={true}>
          <PaymentSummaryComponent
            navigation={this.props.navigation}
            amount={`${AmountInEuroCentsFromNumber.encode(
              this.props.originalAmount
            )}`}
            updatedAmount={`${AmountInEuroCentsFromNumber.encode(
              this.props.updatedAmount
            )}`}
          />
          {formatMdRecipient(this.props.paymentRecipient)}
          {formatMdPaymentReason(this.props.paymentReason)}
          {formatMdInfoRpt(this.props.rptId)}
          <View spacer={true} />
        </Content>
        <View footer={true}>
          <Button
            block={true}
            primary={true}
            onPress={() => this.props.confirmSummary()}
          >
            <Text>{I18n.t("wallet.continue")}</Text>
          </Button>
          <View spacer={true} />
          <Button block={true} light={true} onPress={(): void => this.goBack()}>
            <Text>{I18n.t("wallet.cancel")}</Text>
          </Button>
        </View>
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => ({
  paymentRecipient: paymentRecipientSelector(state).getOrElse(
    UNKNOWN_RECIPIENT
  ),
  paymentReason: paymentReasonSelector(state).getOrElse(""),
  rptId: getRptId(state).getOrElse(UNKNOWN_RPTID),
  originalAmount: getInitialAmount(state).getOrElse(
    UNKNOWN_AMOUNT
  ),
  updatedAmount: currentAmountSelector(state).getOrElse(
    UNKNOWN_AMOUNT
  )
});

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  confirmSummary: () => dispatch(confirmSummary())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionSummaryScreen);

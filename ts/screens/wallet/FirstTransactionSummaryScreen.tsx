/**
 * This screen shows the transaction details.
 * It should occur after the transaction identification by qr scanner or manual procedure.
 * TODO: data displayed by this screen should be evaluated. The following data don't seem to be available:
 *  - expire date
 *  - cbill code
 *  - telephone number
 *  - web page
 *  - pec
 *  - email
 *  - tranche
 *  Data about the subject to which the transfer is releted to could be reviewed too.
 */
import {
  Body,
  Button,
  Container,
  Content,
  H1,
  H3,
  Icon,
  Left,
  Right,
  Text,
  View
} from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import AppHeader from "../../components/ui/AppHeader";
import Modal from "../../components/ui/Modal";
import PaymentSummaryComponent from "../../components/wallet/paymentSummary/PaymentSummaryComponent";
import UpdatedPaymentSummaryComponent from "../../components/wallet/paymentSummary/UpdatedPaymentSummaryComponent";
import I18n from "../../i18n";
import variables from "../../theme/variables";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type State = Readonly<{
  isModalVisible: boolean;
  isAmountUpdated: boolean; // its value will depend on the match withe the amount on the notice and the remote value
  amount: string;
  // The following data should be globally obtained as result of the transaction identification.
  // Further discussions on thier availability is required
  updatedAmount: string;
  expireDate: string;
  tranche: string;
}>;

const styles = StyleSheet.create({
  padded: {
    paddingRight: variables.contentPadding,
    paddingLeft: variables.contentPadding
  }
});

export class FirstTransactionSummaryScreen extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isModalVisible: false,
      isAmountUpdated: true,
      amount: "€ 199,00",
      updatedAmount: "€ 215,00",
      expireDate: "31/01/2018",
      tranche: "unica"
    };
  }

  private goBack() {
    this.props.navigation.goBack();
  }

  /* depending on the comparison between the amount on the notice and the amount saved remotely by the lender
   * it will be displayed a different component
  */
  private getSummary() {
    if (this.state.isAmountUpdated === true) {
      return (
        // if the amount had been updated, it will be displayed and presented with a brief description
        <UpdatedPaymentSummaryComponent
          navigation={this.props.navigation}
          amount={this.state.amount}
          updatedAmount={this.state.updatedAmount}
          expireDate={this.state.expireDate}
          tranche={this.state.tranche}
        />
      );
    } else {
      return (
        <PaymentSummaryComponent
          navigation={this.props.navigation}
          amount={this.state.amount}
          expireDate={this.state.expireDate}
          tranche={this.state.tranche}
        />
      );
    }
  }

  public render(): React.ReactNode {
    // The following data should be globally obtained as result of the transaction identification.
    // Further discussions on thier availability is required
    const NOMEAVVISO: string = "Tari 2018";
    const NOMEENTE: string = "Comune di Gallarate - Settore Tributi";
    const INDIRIZZOENTE: string = "Via Cavour n.2 - Palazzo Broletto,21013";
    const CITTAENTE: string = "Gallarate (VA)";
    const TELENTE: string = "0331.754224";
    const WEBPAGEENTE: string = "www.comune.gallarate.va.it";
    const EMAILENTE: string = "tributi@coumne.gallarate.va.it";
    const PECENTE: string = "protocollo@pec.comune.gallarate.va.it";
    const DESTINATARIO: string = "Mario Rossi";
    const INDIRIZZODESTINATARIO: string = "Via Murillo 8, 20149 Milano (MI)";
    const CBILL: string = "A0EDT";
    const IUV: string = "111116000001580";
    const CODICEENTE: string = "01199250158";

    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={() => this.goBack()}>
              <Icon name="chevron-left" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("wallet.firstTransactionSummary.header")}</Text>
          </Body>
        </AppHeader>

        <Content original={true}>
          <Grid style={styles.padded}>
            <Row>
              <Left>
                <H3>{I18n.t("wallet.firstTransactionSummary.title")}</H3>
                <H1>{NOMEAVVISO}</H1>
              </Left>
              <Right>
                <Image
                  source={require("../../../img/wallet/icon-avviso-pagopa.png")}
                />
              </Right>
            </Row>
            <View spacer={true} large={true} />
          </Grid>
          {this.getSummary()}
          <View spacer={true} large={true} />
          <Grid style={styles.padded}>
            <Row>
              <Text bold={true}>
                {I18n.t("wallet.firstTransactionSummary.entity")}
              </Text>
            </Row>
            <Row>
              <Text>{NOMEENTE}</Text>
            </Row>
            <Row>
              <Text>{INDIRIZZOENTE}</Text>
            </Row>
            <Row>
              <Text>{CITTAENTE}</Text>
            </Row>
            <Row>
              <Text>{I18n.t("wallet.firstTransactionSummary.info")}</Text>
            </Row>
            <Row>
              <Text>{I18n.t("wallet.firstTransactionSummary.tel")}</Text>
              <Text> {""} </Text>
              <Text link={true}>{TELENTE}</Text>
            </Row>
            <Row>
              <Text link={true}>{WEBPAGEENTE}</Text>
            </Row>
            <Row>
              <Text>{I18n.t("wallet.firstTransactionSummary.email")}</Text>
              <Text> {""} </Text>
              <Text link={true}>{EMAILENTE}</Text>
            </Row>
            <Row>
              <Text>{I18n.t("wallet.firstTransactionSummary.PEC")}</Text>
              <Text> {""} </Text>
              <Text link={true}>{PECENTE}</Text>
            </Row>
            <View spacer={true} large={true} />
            <Row>
              <Text bold={true}>
                {I18n.t("wallet.firstTransactionSummary.recipient")}
              </Text>
            </Row>
            <Row>
              <Text>{DESTINATARIO}</Text>
            </Row>
            <Row>
              <Text>{INDIRIZZODESTINATARIO}</Text>
            </Row>
            <View spacer={true} large={true} />
            <Row>
              <Text bold={true}>
                {I18n.t("wallet.firstTransactionSummary.object")}
              </Text>
            </Row>
            <Row>
              <Text>{NOMEAVVISO}</Text>
            </Row>
            <View spacer={true} large={true} />
            <Row>
              <Text bold={true}>
                {I18n.t("wallet.firstTransactionSummary.cbillCode")}
              </Text>
              <Text> {""} </Text>
              <Text bold={true}>{CBILL}</Text>
            </Row>
            <Row>
              <Text bold={true}>
                {I18n.t("wallet.firstTransactionSummary.iuv")}
              </Text>
              <Text> {""} </Text>
              <Text bold={true}>{IUV}</Text>
            </Row>
            <Row>
              <Text bold={true}>
                {I18n.t("wallet.firstTransactionSummary.entityCode2")}
              </Text>
              <Text> {""} </Text>
              <Text bold={true}>{CODICEENTE}</Text>
            </Row>
            <View spacer={true} extralarge={true} />
          </Grid>
        </Content>
        <View footer={true}>
          <Button block={true} primary={true}>
            <Text>{I18n.t("wallet.continue")}</Text>
          </Button>
          <Button block={true} light={true} onPress={(): void => this.goBack()}>
            <Text>{I18n.t("wallet.cancel")}</Text>
          </Button>
        </View>

        <Modal isVisible={this.state.isModalVisible} fullscreen={true}>
          <View header={true}>
            <Icon
              name="cross"
              onPress={(): void => this.setState({ isModalVisible: false })}
            />
          </View>
          <Content>
            <H1>{I18n.t("personal_data_processing.title")}</H1>
            <View spacer={true} large={true} />
            <Text>{I18n.t("personal_data_processing.content")}</Text>
          </Content>
        </Modal>
      </Container>
    );
  }
}

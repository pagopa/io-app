import * as React from "react";
import {
  Container,
  Content,
  Body,
  Left,
  Right,
  Button,
  Icon,
  Text,
  H1,
  H3,
  View
} from "native-base";
import AppHeader from "../../components/ui/AppHeader";
import {
  Grid,
  Row,
  Col
} from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import variables from '../../theme/variables';
import I18n from "../../i18n";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

/**
 * Portfolio provide a resume on the payment
 */

class ReceiptPaymentScreen extends React.Component<Props, never> {
  constructor(props: Props) {
    super(props);
  }

  private goBack() {
    this.props.navigation.goBack();
  }

  public render(): React.ReactNode {
    const TOTALE: string = "-199,50";
    const IMPORTO: string = "199,00";
    const FEE: string = "0,50";
    const CAUSALE: string = "Tari 2018";
    const DESTINATARIO: string = "Comune di Gallarate";
    const DATA: string = "02/02/2017";
    const ORA: string = "23.51";

    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={() => this.goBack()}>
              <Icon name="chevron-left" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("portfolio.Receipt.title")}</Text>
          </Body>
        </AppHeader>

        <Content style={{paddingRight:variables.contentPadding, paddingLeft:variables.contentPadding}}>
          <Grid>
            <Col size={1}/>
            <Col size={3} style={{alignItems:'center'}}>
              <Row>
                <Icon name="check"/>
                <H1>{I18n.t("portfolio.Receipt.thanks")}</H1>
              </Row>
              <Row>
                <Text> {I18n.t("portfolio.Receipt.endPayment")} </Text>
              </Row>
            </Col>
            <Col size={1}/>
          </Grid>
          
          <Grid>
            <Row>
              <H1> {I18n.t("portfolio.Receipt.details")}</H1>
              <Right>
                <Icon name="cross"/>
              </Right>
            </Row>
            <Row>
              <Col size={1}>
                <View spacer={true} extralarge={true}/>
                <H3> {I18n.t("portfolio.Receipt.total")}  </H3>
              </Col>
              <Col size={2}>
                <View spacer={true} extralarge={true}/>
                <H1> {TOTALE} </H1>
              </Col>
            </Row>
            <Row>
              <Col>
                <View spacer={true} extralarge={true}/>
                <Text> {I18n.t("portfolio.Receipt.amount")}  </Text>
                <View spacer={true}/>
              </Col>
              <Col>
                <View spacer={true} extralarge={true}/>
                <Text style={{textAlign:'right', fontWeight:'bold'}}> {IMPORTO} </Text>
                <View spacer={true} />
              </Col>
            </Row>
            <Row>
              <Col>
                <Text> {I18n.t("portfolio.Receipt.fee")} </Text>
                <Text link={true}> {I18n.t("portfolio.Receipt.why")} </Text>
                <View spacer={true}/>
              </Col>
              <Col>
                <Text style={{textAlign:'right', fontWeight:'bold'}}> {FEE} </Text>
              </Col>
            </Row>
            <Row>
              <Col>
                <Text> {I18n.t("portfolio.Receipt.purpose")} </Text>
                <View spacer={true}/>
              </Col>
              <Col>
                <Text style={{textAlign:'right', fontWeight:'bold'}}> {CAUSALE} </Text>
              </Col>
            </Row>
            <Row>
              <Col>
                <Text> {I18n.t("portfolio.Receipt.recipient")} </Text>
                <View spacer={true}/>
              </Col>
              <Col>
                <Text style={{textAlign:'right', fontWeight:'bold'}}> {DESTINATARIO} </Text>
              </Col>
            </Row>
            <Row>
              <Col>
                <Text> {I18n.t("portfolio.Receipt.date")} </Text>
                <View spacer={true}/>
              </Col>
              <Col>
                <Text style={{textAlign:'right', fontWeight:'bold'}}> {DATA} </Text>
              </Col>
            </Row>
            <Row>
              <Col>
                <Text> {I18n.t("portfolio.Receipt.hour")} </Text>
                <View spacer={true}/>
              </Col>
              <Col>
                <Text style={{textAlign:'right', fontWeight:'bold'}}> {ORA} </Text>
              </Col>
            </Row>
          </Grid>
        </Content>
      </Container>
    );
  }
}

export default ReceiptPaymentScreen;

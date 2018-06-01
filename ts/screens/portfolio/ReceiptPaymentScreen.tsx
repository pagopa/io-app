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
import { StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import variables from '../../theme/variables';
import I18n from "../../i18n";
import Modal from "../../components/ui/Modal";
import { WalletStyles } from "../../components/styles/wallet";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type State = Readonly<{
	isTosModalVisible: boolean;
 }>;

/**
 * Portfolio provide a resume on the payment
 */
class ReceiptPaymentScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isTosModalVisible:false
    }
  }

  private goBack(): React.ReactNode {
    return (
        <Left>
          <Button
            transparent={true}
            onPress={_ => 
              this.props.navigation.goBack()
            }
          >
            <Icon 
              style={WalletStyles.white} 
              name="chevron-left" 
            />
          </Button>
        </Left>
    );
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
        <AppHeader style={WalletStyles.header}>
          {this.goBack()}
          <Body>
            <Text style={WalletStyles.white}>
              {I18n.t("portfolio.Receipt.title")} 
            </Text>
          </Body>
        </AppHeader>

        <Content original={true}>
          <View style={{backgroundColor: variables.brandDarkGray}}>
            <Grid>
              <Col size={1}/>
              <Col 
                size={5} 
                style={{alignItems:'center'}}
              >
                <View 
                  spacer={true} 
                  large={true}
                />
                <Row>
                  <Icon 
                    name="check" 
                    style={{color: variables.brandLight}} 
                  />
                  <H1 style={{color:variables.brandLight}}>
                    {I18n.t("portfolio.Receipt.thanks")}
                  </H1>
                </Row>
                <Row>
                  <Text style={{color:variables.brandLight}}>
                    {I18n.t("portfolio.Receipt.endPayment")} 
                  </Text>
                </Row>
                <View
                  spacer={true} 
                  large={true}
                />
              </Col>
              <Col size={1}/>
            </Grid>
          </View>
          <View style={{padding: variables.contentPadding}}>
          <Grid>
            <Row>
              <H1> 
                {I18n.t("portfolio.Receipt.details")}
              </H1>
              <Right>
                <Icon name="cross"/>
              </Right>
            </Row>
            <Row>
              <Col size={1}>
                <View 
                  spacer={true} 
                  extralarge={true}
                />
                <H3> 
                 {I18n.t("portfolio.Receipt.total")}  
                </H3>
              </Col>
              <Col size={2}>
                <View
                  spacer={true} 
                  extralarge={true}
                 />
                <H1> 
                  {TOTALE} 
                </H1>
              </Col>
            </Row>
            <Row>
              <Col>
                <View 
                  spacer={true} 
                  extralarge={true}
                />
                <Text> 
                  {I18n.t("portfolio.Receipt.amount")}  
                </Text>
                <View spacer={true}/>
              </Col>
              <Col>
                <View
                   spacer={true} 
                  extralarge={true}
                />
                <H3 style={styles.bolded}> 
                  {IMPORTO} 
                </H3>
                <View spacer={true} />
              </Col>
            </Row>
            <Row>
              <Col style={{flexDirection: 'row'}}>
                <Text>
                   {I18n.t("portfolio.Receipt.fee")} 
                </Text>
                <Text 
                  link={true}
                  onPress={(): void => 
                    this.setState({ isTosModalVisible: true })
                  }
                > 
                  {I18n.t("portfolio.Receipt.why")} 
                </Text>
                <View spacer={true}/>
              </Col>
              <Col>
                <H3 style={styles.bolded}> 
                  {FEE} 
                </H3>
                <View spacer={true}/>
              </Col>
            </Row>
            <Row>
              <Col size={1}>
                <Text> 
                  {I18n.t("portfolio.Receipt.purpose")} 
                </Text>
                <View spacer={true}/>
              </Col>
              <Col size={2}>
                <H3 style={styles.bolded}> 
                  {CAUSALE} 
                </H3>
              </Col>
            </Row>
            <Row>
              <Col size={1}>
                <Text> 
                  {I18n.t("portfolio.Receipt.recipient")} 
                </Text>
                <View spacer={true}/>
              </Col>
              <Col size={2}>
                <H3 style={styles.bolded}>
                  {DESTINATARIO}
                 </H3>
              </Col>
            </Row>
            <Row>
              <Col>
                <Text> 
                  {I18n.t("portfolio.Receipt.date")} 
                </Text>
                <View spacer={true}/>
              </Col>
              <Col>
                <H3 style={styles.bolded}> 
                  {DATA} 
                </H3>
              </Col>
            </Row>
            <Row>
              <Col>
                <Text> 
                  {I18n.t("portfolio.Receipt.time")} 
                </Text>
                <View spacer={true}/>
              </Col>
              <Col>
                <H3 style={styles.bolded}> 
                  {ORA}
                 </H3>
              </Col>
            </Row>
          </Grid>
          </View>
        </Content>

        <Modal 
          isVisible={this.state.isTosModalVisible} 
          fullscreen={true}>
          <View header={true}>
            <Icon
              name="cross"
              onPress={(): void => 
                this.setState({ isTosModalVisible: false })
             }
            />
          </View>
          <Content>
            <H1>
              {I18n.t("personal_data_processing.title")}
            </H1>
            <View 
              spacer={true} 
              large={true} 
            />
            <Text>
              {I18n.t("personal_data_processing.content")}
            </Text>
          </Content>
        </Modal>
      </Container>
    );
  }
}

export default ReceiptPaymentScreen;

const styles = StyleSheet.create({ 
	bolded: {
    textAlign:'right', 
    fontWeight:'bold'
  }
})
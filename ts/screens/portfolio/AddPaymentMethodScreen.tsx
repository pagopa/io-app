import * as React from "react";
import I18n from "../../i18n"

import { Button, View } from "native-base";
import {
  Container,
  Content,
  Grid,
  H1,
  Icon,
  Left,
  List,
  ListItem,
  Right,
  Row,
  Text } from "native-base";
import { Image } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { PortfolioStyles } from "../../components/styles"
import Modal from "../../components/ui/Modal"
import ROUTES from "../../navigation/routes"

// Images
const bankLogo = require("../../../img/portfolio/add-method/bank.png")
const creditCardLogo = require("../../../img/portfolio/add-method/creditcard.png")
const mobileLogo = require("../../../img/portfolio/add-method/mobile.png")

type Props = {
    navigation: NavigationScreenProp<NavigationState>
}

type State = {
    isTosModalVisible: boolean
}

const paymentMethods = [
  {
      navigateTo: ROUTES.PORTFOLIO_ADD_CARD,
      name: I18n.t("portfolio.methods.card.name"),
      maxFee: I18n.t("portfolio.methods.card.maxFee"),
      icon: creditCardLogo
  },
  {
      navigateTo: "Test",
      name: I18n.t("portfolio.methods.bank.name"),
      maxFee: I18n.t("portfolio.methods.bank.maxFee"),
      icon: bankLogo
  },
  {
      navigateTo: "Test",
      name: I18n.t("portfolio.methods.mobile.name"),
      maxFee: I18n.t("portfolio.methods.mobile.maxFee"),
      icon: mobileLogo
  },
];

export class AddPaymentMethodScreen extends React.Component<Props,State> {

  public static navigationOptions = {
      title: I18n.t("portfolio.addPaymentMethodTitle"),
      headerBackTitle: null
  }

  constructor(props: Props) {
    super(props)
    this.state = {
        isTosModalVisible: false
    }
  }

  public render(): React.ReactNode {
      const {navigate} = this.props.navigation;

      return (
          <Container>
              <Content>
                  <Text style={{marginBottom:15}}>{I18n.t("portfolio.chooseMethod")} </Text>
                  <List
                      style={{padding:0, margin:0}}
                      removeClippedSubviews={false}
                      dataArray = {paymentMethods}
                      renderRow = {(item) =>
                          <ListItem style={{marginLeft: 0, flex:1, paddingRight: 0}} onPress={()=> navigate(item.navigateTo)} >
                          <Left>
                              <Grid>
                                  <Row>
                                      <Text style={PortfolioStyles.payBoldStyle}>{item.name}</Text>
                                  </Row>
                                  <Row>
                                      <Text style={PortfolioStyles.payLightStyle}>{item.maxFee}</Text>
                                  </Row>
                              </Grid>
                          </Left>
                          <Right style={{alignItems:"center"}}>
                              <Image source={item.icon} style={{resizeMode:"contain"}}/>
                          </Right>
                      </ListItem>
                      }>
                  </List>
                  <Text link style={{marginTop:10}} onPress={(): void => this.setState({ isTosModalVisible: true })}
                  >{I18n.t("portfolio.whyFee")}</Text>
              </Content>

              <View footer >
                  <Button block light style={{backgroundColor:"#5C6F82"}} onPress={(): boolean=>this.props.navigation.goBack()}>
                      <Text style={{color:"white"}}>
                          {I18n.t("portfolio.cancel")}
                      </Text>
                  </Button>
              </View>

              <Modal isVisible={this.state.isTosModalVisible} fullscreen>
                  <View header>
                      <Icon
                      name="cross"
                      onPress={(): void => this.setState({ isTosModalVisible: false })}
                      />
                  </View>
                  <Content>
                      <H1>{I18n.t("personal_data_processing.title")}</H1>
                      <View spacer large />
                      <Text>{I18n.t("personal_data_processing.content")}</Text>
                  </Content>
              </Modal>

          </Container>

      );

  }
}

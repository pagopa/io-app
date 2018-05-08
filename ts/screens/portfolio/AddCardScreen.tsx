import {
  Button,
  Col,
  Content,
  Grid,
  Icon,
  Input,
  Item,
  Text
} from "native-base";
import * as React from "react";
import { FlatList, Image, View } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";

import {
  CreditCardIcons,
  CreditCardType
} from "../../types/portfolio/CreditCardType";
import { PortfolioStyles } from "../../components/styles";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type State = Readonly<{
  cardNumber: string;
  expireDate: string;
  secureCode: string;
  cardHolder: string;
}>;

export class AddCardScreen extends React.Component<Props, State> {
  public static navigationOptions = {
    title: I18n.t("portfolio.addCardTitle"),
    headerBackTitle: null
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      cardNumber: "",
      expireDate: "",
      secureCode: "",
      cardHolder: ""
    };
  }

  public render(): React.ReactNode {
    const displayedCards: ReadonlyArray<CreditCardType> = [
      CreditCardType.MASTERCARD,
      CreditCardType.MAESTRO,
      CreditCardType.VISA,
      CreditCardType.VISAELECTRON,
      CreditCardType.AMEX,
      CreditCardType.POSTEPAY,
      CreditCardType.DINERS
    ];

    return (
      <Content>
        <Item
          style={{
            borderBottomWidth: 0,
            marginTop: 5,
            marginRight: 5,
            marginLeft: 5,
            padding: 0
          }}
        >
          <Text>{I18n.t("portfolio.dummyCard.labels.name")}</Text>
        </Item>
        <Item
          style={{
            borderBottomWidth: 3,
            borderBottomColor: "#000000",
            marginRight: 5,
            marginLeft: 5
          }}
        >
          <Icon
            style={{ marginTop: 3, marginRight: 3, marginBottom: 3 }}
            name="user"
          />
          <Input
            onChangeText={value => {
              this.setState({ cardHolder: value });
            }}
            autoCapitalize={"words"}
            placeholder={I18n.t("portfolio.dummyCard.values.name")}
          />
        </Item>
        <Item style={PortfolioStyles.addCardItem}>
          <Text>{I18n.t("portfolio.dummyCard.labels.number")}</Text>
        </Item>
        <Item style={{ borderBottomWidth: 1, marginRight: 5, marginLeft: 5 }}>
          <Icon
            style={{ marginTop: 3, marginRight: 3, marginBottom: 3 }}
            name="credit-card"
          />
          <Input
            onChangeText={value => {
              this.setState({ cardNumber: value });
            }}
            keyboardType={"numeric"}
            placeholderTextColor={"#D0D6DB"}
            placeholder={I18n.t("portfolio.dummyCard.values.number")}
          />
        </Item>
        <Item style={PortfolioStyles.addCardItem}>
          <Grid>
            <Col>
              <Item style={PortfolioStyles.addCardItem}>
                <Text>{I18n.t("portfolio.dummyCard.labels.expires")}</Text>
              </Item>
              <Item
                style={{ borderBottomWidth: 1, marginRight: 5, marginLeft: 5 }}
              >
                <Icon
                  style={{ marginTop: 3, marginRight: 3, marginBottom: 3 }}
                  name="calendar"
                />
                <Input
                  onChangeText={value => {
                    this.setState({ expireDate: value });
                  }}
                  placeholderTextColor={"#D0D6DB"}
                  placeholder={I18n.t("portfolio.dummyCard.values.expires")}
                />
              </Item>
            </Col>
            <Col>
              <Item style={PortfolioStyles.addCardItem}>
                <Text>{I18n.t("portfolio.dummyCard.labels.csc")}</Text>
              </Item>
              <Item
                style={{ borderBottomWidth: 1, marginRight: 5, marginLeft: 5 }}
              >
                <Icon
                  style={{ marginTop: 3, marginRight: 3, marginBottom: 3 }}
                  name="lock"
                />
                <Input
                  onChangeText={value => {
                    this.setState({ secureCode: value });
                  }}
                  keyboardType={"numeric"}
                  maxLength={3}
                  secureTextEntry={true}
                  placeholderTextColor={"#D0D6DB"}
                  placeholder={I18n.t("portfolio.dummyCard.values.csc")}
                />
              </Item>
            </Col>
          </Grid>
        </Item>

        <Item style={PortfolioStyles.addCardItem}>
          <Text>{I18n.t("portfolio.acceptedCards")}</Text>
        </Item>

        <Item
          last
          style={{
            borderBottomWidth: 0,
            marginRight: 5,
            marginLeft: 5,
            marginBottom: 30
          }}
        >
          <FlatList
            style={{ alignSelf: "center" }}
            data={displayedCards}
            numColumns={4}
            renderItem={({ item }) => (
              <Image
                style={{
                  width: 60,
                  height: 45,
                  resizeMode: "contain",
                  margin: 5
                }}
                source={CreditCardIcons[item]}
              />
            )}
            keyExtractor={item => item}
          />
        </Item>

        <View
          style={{
            borderBottomWidth: 0,
            marginRight: 5,
            marginLeft: 5,
            marginTop: 15,
            marginBottom: 30
          }}
        >
          <Button
            block
            primary
            onPress={(): boolean =>
              this.props.navigation.navigate(ROUTES.PORTFOLIO_SAVE_CARD)
            }
          >
            <Text>{I18n.t("portfolio.continue")}</Text>
          </Button>

          <Button
            block
            light
            style={{ backgroundColor: "#5C6F82", marginTop: 5 }}
            onPress={(): boolean => this.props.navigation.goBack()}
          >
            <Text style={{ color: "white" }}>{I18n.t("portfolio.cancel")}</Text>
          </Button>
        </View>
      </Content>
    );
  }
}

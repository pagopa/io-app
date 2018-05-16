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

import { PortfolioStyles } from "../../components/styles";
import {
  CreditCardIcons,
  CreditCardType
} from "../../types/portfolio/CreditCardType";

import { none, Option, some } from "fp-ts/lib/Option";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type State = Readonly<{
  cardNumber: Option<string>;
  expireDate: Option<string>;
  secureCode: Option<string>;
  cardHolder: Option<string>;
}>;

export class AddCardScreen extends React.Component<Props, State> {
  public static navigationOptions = {
    title: I18n.t("portfolio.addCardTitle"),
    headerBackTitle: null
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      cardNumber: none,
      expireDate: none,
      secureCode: none,
      cardHolder: none
    };
  }

  public onExpireDateChange(value: string) {
    this.changeExpireDateAppeareance(value);
  }

  // method to modify the appearence of the expire date so that it includes the character "/"after 2 numbers
  public changeExpireDateAppeareance(value: string) {
    const str = value.trim();
    if (str.match(/^[\d\s]*$/)) {
      const newString = str.replace(/\s/, "").match(/\d{1,2}/g);
      if (newString !== null) {
        const formattedText = newString.join("/");
        this.setState({ expireDate: some(formattedText) });
      }
    }
  }

  // method to modify the appearence of the card number so that it includes a space each 4 numbers
  public changeCardnumberAppeareance(value: string) {
    const str = value.trim();
    if (str.match(/^[\d\s]*$/)) {
      const newString = str.replace(/\s/, "").match(/\d{1,4}/g);
      if (newString !== null) {
        const formattedText = newString.join(" ");
        this.setState({ cardNumber: some(formattedText) });
      }
    }
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
        <Item style={PortfolioStyles.addCardItem}>
          <Text>{I18n.t("portfolio.dummyCard.labels.name")}</Text>
        </Item>
        <Item style={PortfolioStyles.addCardBoldedBorderItem}>
          <Icon style={PortfolioStyles.addCardIcon} name="user" />
          <Input
            onChangeText={value => {
              this.setState({ cardHolder: some(value) });
            }}
            autoCapitalize={"words"}
            placeholder={I18n.t("portfolio.dummyCard.values.name")}
          />
        </Item>
        <Item style={PortfolioStyles.addCardItem}>
          <Text>{I18n.t("portfolio.dummyCard.labels.number")}</Text>
        </Item>
        <Item style={PortfolioStyles.addCardBordedItem}>
          <Icon style={PortfolioStyles.addCardIcon} name="credit-card" />
          <Input
            onChangeText={value => {
              this.changeCardnumberAppeareance(value);
            }}
            value={this.state.cardNumber.getOrElse("")}
            keyboardType={"numeric"}
            maxLength={23}
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
              <Item style={PortfolioStyles.addCardBordedItem}>
                <Icon style={PortfolioStyles.addCardIcon} name="calendar" />
                <Input
                  onChangeText={value => {
                    this.onExpireDateChange(value);
                  }}
                  value={this.state.expireDate.getOrElse("")}
                  maxLength={5}
                  keyboardType={"numeric"}
                  placeholderTextColor={"#D0D6DB"}
                  placeholder={I18n.t("portfolio.dummyCard.values.expires")}
                />
              </Item>
            </Col>
            <Col>
              <Item style={PortfolioStyles.addCardItem}>
                <Text>{I18n.t("portfolio.dummyCard.labels.csc")}</Text>
              </Item>
              <Item style={PortfolioStyles.addCardBordedItem}>
                <Icon style={PortfolioStyles.addCardIcon} name="lock" />
                <Input
                  onChangeText={value => {
                    this.setState({ secureCode: some(value) });
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

        <Item last={true} style={PortfolioStyles.addCardLastItem}>
          <FlatList
            style={{ alignSelf: "center" }}
            data={displayedCards}
            numColumns={4}
            renderItem={({ item }) => (
              <Image
                style={PortfolioStyles.addCardImage}
                source={CreditCardIcons[item]}
              />
            )}
            keyExtractor={item => item}
          />
        </Item>

        <View style={PortfolioStyles.addCardfooterButtons}>
          <Button
            block={true}
            primary={true}
            onPress={(): boolean =>
              this.props.navigation.navigate(ROUTES.PORTFOLIO_SAVE_CARD)
            }
          >
            <Text>{I18n.t("portfolio.continue")}</Text>
          </Button>

          <Button
            block={true}
            light={true}
            style={PortfolioStyles.payCancelButton}
            onPress={(): boolean => this.props.navigation.goBack()}
          >
            <Text style={PortfolioStyles.payCancelButtonText}>
              {I18n.t("portfolio.cancel")}
            </Text>
          </Button>
        </View>
      </Content>
    );
  }
}

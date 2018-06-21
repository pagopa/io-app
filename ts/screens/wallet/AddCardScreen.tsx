import {
  Button,
  Container,
  Content,
  Icon,
  Input,
  Item,
  Text,
  View
} from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";

import { none, Option, some } from "fp-ts/lib/Option";
import _ from "lodash";
import { Col, Grid } from "react-native-easy-grid";
import { cardIcons } from "../../components/wallet/card/Logo";
import WrappedGrid from "../../components/WrappedGrid";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type State = Readonly<{
  pan: Option<string>;
  expirationDate: Option<string>;
  securityCode: Option<string>;
  holder: Option<string>;
}>;

const styles = StyleSheet.create({
  noBottomLine: {
    borderBottomWidth: 0
  },
  bottomLine: {
    borderBottomWidth: 1
  },
  addCardIcon: {
    marginTop: 3,
    marginRight: 3,
    marginBottom: 3
  },
  addCardImage: {
    width: 60,
    height: 45,
    resizeMode: "contain",
    marginTop: 5
  },
  verticalSpacing: {
    width: 16,
    flex: 0
  }
});

export class AddCardScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      pan: none,
      expirationDate: none,
      securityCode: none,
      holder: none
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
        this.setState({ expirationDate: some(formattedText) });
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
        this.setState({ pan: some(formattedText) });
      }
    }
  }

  public render(): React.ReactNode {
    const displayedCards = {
      MASTERCARD: cardIcons.MASTERCARD,
      MAESTRO: cardIcons.MAESTRO,
      VISA: cardIcons.VISA,
      VISAELECTRON: cardIcons.VISAELECTRON,
      AMEX: cardIcons.AMEX,
      POSTEPAY: cardIcons.POSTEPAY,
      DINERS: cardIcons.DINERS
    };

    return (
      <Container>
        <Content>
          <Item style={styles.noBottomLine}>
            <Text>{I18n.t("wallet.dummyCard.labels.name")}</Text>
          </Item>
          <Item style={styles.bottomLine}>
            <Icon style={styles.addCardIcon} name="user" />
            <Input
              onChangeText={value => {
                this.setState({ holder: some(value) });
              }}
              autoCapitalize={"words"}
              placeholder={I18n.t("wallet.dummyCard.values.name")}
            />
          </Item>

          <View spacer={true} />
          <Item style={styles.noBottomLine}>
            <Text>{I18n.t("wallet.dummyCard.labels.number")}</Text>
          </Item>
          <Item style={styles.bottomLine}>
            <Icon style={styles.addCardIcon} name="credit-card" />
            <Input
              onChangeText={value => {
                this.changeCardnumberAppeareance(value);
              }}
              value={this.state.pan.getOrElse("")}
              keyboardType={"numeric"}
              maxLength={23}
              placeholderTextColor={"#D0D6DB"}
              placeholder={I18n.t("wallet.dummyCard.values.number")}
            />
          </Item>

          <View spacer={true} />
          <Grid>
            <Col>
              <Item style={styles.noBottomLine}>
                <Text>{I18n.t("wallet.dummyCard.labels.expires")}</Text>
              </Item>
              <Item style={styles.bottomLine}>
                <Icon style={styles.addCardIcon} name="calendar" />
                <Input
                  onChangeText={value => {
                    this.onExpireDateChange(value);
                  }}
                  value={this.state.expirationDate.getOrElse("")}
                  maxLength={5}
                  keyboardType={"numeric"}
                  placeholderTextColor={"#D0D6DB"}
                  placeholder={I18n.t("wallet.dummyCard.values.expires")}
                />
              </Item>
            </Col>
            <Col style={styles.verticalSpacing} />
            <Col>
              <Item style={styles.noBottomLine}>
                <Text>{I18n.t("wallet.dummyCard.labels.csc")}</Text>
              </Item>
              <Item style={styles.bottomLine}>
                <Icon style={styles.addCardIcon} name="lock" />
                <Input
                  onChangeText={value => {
                    this.setState({ securityCode: some(value) });
                  }}
                  keyboardType={"numeric"}
                  maxLength={3}
                  secureTextEntry={true}
                  placeholderTextColor={"#D0D6DB"}
                  placeholder={I18n.t("wallet.dummyCard.values.csc")}
                />
              </Item>
            </Col>
          </Grid>

          <View spacer={true} />
          <Item style={styles.noBottomLine}>
            <Text>{I18n.t("wallet.acceptedCards")}</Text>
          </Item>

          <Item last={true} style={styles.noBottomLine}>
            <WrappedGrid
              cols={4}
              items={_
                .values(displayedCards)
                .map(item => (
                  <Image style={styles.addCardImage} source={item} />
                ))}
            />
          </Item>
        </Content>
        <View footer={true}>
          <Button
            block={true}
            primary={true}
            onPress={(): boolean =>
              this.props.navigation.navigate(ROUTES.WALLET_HOME)
            }
          >
            <Text>{I18n.t("global.buttons.continue")}</Text>
          </Button>
          <View spacer={true} />
          <Button
            block={true}
            light={true}
            onPress={(): boolean => this.props.navigation.goBack()}
          >
            <Text>{I18n.t("global.buttons.cancel")}</Text>
          </Button>
        </View>
      </Container>
    );
  }
}

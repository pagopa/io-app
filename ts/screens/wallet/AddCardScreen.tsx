import {
  Body,
  Button,
  Container,
  Content,
  Item,
  Text,
  View
} from "native-base";
import * as React from "react";
import { Image, ScrollView, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";

import { none, Option, some } from "fp-ts/lib/Option";
import { Col, Grid } from "react-native-easy-grid";
import { cardIcons } from "../../components/wallet/card/Logo";
import WrappedGrid from "../../components/WrappedGrid";

import { Left } from "native-base";
import { LabelledItem } from "../../components/LabelledItem";
import { WalletStyles } from "../../components/styles/wallet";
import AppHeader from "../../components/ui/AppHeader";
import Icon from "../../theme/font-icons/io-icon-font";
import variables from "../../theme/variables";

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

  /**
   * method to modify the formatting of the expiration date
   * it currently adds a "/" after the month (if a valid
   * value is entered) and converts 4-digits years in their
   * 2-digits versions
   * This is a draft version -- the exact behavior should be
   * defined somewhere in order for it to be implemented
   */
  public onExpirationDateChange = (value: string) => {
    const filteredValue = value.replace(/[^\d\/]/g, "");
    // month has already been entered fully ("1" is ignored as another number may follow)
    if (filteredValue.match(/^(1[012]|0[1-9]|[2-9])$/)) {
      this.setState({ expirationDate: some(`${filteredValue}/`) }); // make "/" separator pop up
    } else if (filteredValue.match(/\/\d{3,}$/)) {
      // if the year is on 3+ digits, cut the
      // first one (so if user
      // is entering 2022 it will accept
      // [in () the cropped part]
      // 2 -> 20 -> (2)02 -> (20)22
      const [month, year] = filteredValue.split("/");
      this.setState({ expirationDate: some(`${month}/${year.slice(-2)}`) });
    } else {
      this.setState({
        expirationDate: filteredValue.length > 0 ? some(filteredValue) : none
      });
    }
  };

  // update pan so as to add a space every 4 digits
  // the exact behavior should be defined before
  // being implemented
  public onPanChange = (value: string) => {
    const quads = value.replace(/[^\d]/g, "").match(/\d{1,4}/g);
    if (quads !== null) {
      const formatted = quads.join(" ");
      this.setState({
        pan:
          formatted.length > 0
            ? some(
                quads[quads.length - 1].length === 4
                  ? `${formatted} `
                  : formatted
              )
            : none
      });
    }
  };

  public render(): React.ReactNode {
    const displayedCards: ReadonlyArray<any> = [
      cardIcons.MASTERCARD,
      cardIcons.MAESTRO,
      cardIcons.VISA,
      cardIcons.VISAELECTRON,
      cardIcons.AMEX,
      cardIcons.POSTEPAY,
      cardIcons.DINERS
    ];

    return (
      <Container>
        <AppHeader>
          <Left>
            <Button
              transparent={true}
              onPress={_ => this.props.navigation.goBack()}
            >
              <Icon name="io-back" size={variables.iconSize3} />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("wallet.addCardTitle")}</Text>
          </Body>
        </AppHeader>

        <ScrollView bounces={false} style={WalletStyles.whiteBg}>
          <Content scrollEnabled={false}>
            <LabelledItem
              label={I18n.t("wallet.dummyCard.labels.holder")}
              icon="io-titolare"
              placeholder={I18n.t("wallet.dummyCard.values.holder")}
              inputProps={{
                onChangeText: value => {
                  this.setState({ holder: some(value) });
                },
                value: this.state.holder.getOrElse(""),
                autoCapitalize: "words"
              }}
            />

            <View spacer={true} />

            <LabelledItem
              label={I18n.t("wallet.dummyCard.labels.pan")}
              icon="io-carta"
              placeholder={I18n.t("wallet.dummyCard.values.pan")}
              inputProps={{
                onChangeText: this.onPanChange,
                value: this.state.pan.getOrElse(""),
                keyboardType: "numeric",
                maxLength: 23
              }}
            />

            <View spacer={true} />
            <Grid>
              <Col>
                <LabelledItem
                  label={I18n.t("wallet.dummyCard.labels.expirationDate")}
                  icon="io-calendario"
                  placeholder={I18n.t("wallet.dummyCard.values.expirationDate")}
                  inputProps={{
                    onChangeText: this.onExpirationDateChange,
                    value: this.state.expirationDate.getOrElse(""),
                    keyboardType: "numeric"
                  }}
                />
              </Col>
              <Col style={styles.verticalSpacing} />
              <Col>
                <LabelledItem
                  label={I18n.t("wallet.dummyCard.labels.securityCode")}
                  icon="io-lucchetto"
                  placeholder={I18n.t("wallet.dummyCard.values.securityCode")}
                  inputProps={{
                    onChangeText: value => {
                      this.setState({ securityCode: some(value) });
                    },
                    value: this.state.securityCode.getOrElse(""),
                    keyboardType: "numeric",
                    maxLength: 4,
                    secureTextEntry: true
                  }}
                />
              </Col>
            </Grid>

            <View spacer={true} />
            <Item style={styles.noBottomLine}>
              <Text>{I18n.t("wallet.acceptedCards")}</Text>
            </Item>
            <Item last={true} style={styles.noBottomLine}>
              <WrappedGrid
                cols={4}
                keyPrefix="cards"
                items={displayedCards.map(item => (
                  <Image style={styles.addCardImage} source={item} />
                ))}
              />
            </Item>
          </Content>
        </ScrollView>
        <View footer={true}>
          <Button
            block={true}
            primary={true}
            onPress={() => this.props.navigation.navigate(ROUTES.WALLET_HOME)}
          >
            <Text>{I18n.t("global.buttons.continue")}</Text>
          </Button>
          <View spacer={true} />
          <Button
            block={true}
            light={true}
            onPress={() => this.props.navigation.goBack()}
          >
            <Text>{I18n.t("global.buttons.cancel")}</Text>
          </Button>
        </View>
      </Container>
    );
  }
}

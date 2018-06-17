/**
 * Layout for the wallet section of the app.
 * This is comprised by a customizable header part
 * (with optionally a card displayed on the bottom
 * of this header), and a customized content on
 * the bottom part of the screen. Both are
 * wrapped in a ScrollView, and optionally a
 * footer with a button for starting a new payment
 */
import { Body, Container, Content, Text, View } from "native-base";
import { Button } from "native-base";
import { Left } from "native-base";
import * as React from "react";
import { ScrollView } from "react-native";
import { Image, StyleSheet, TouchableHighlight } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import Icon from "../../theme/font-icons/io-icon-font";
import variables from "../../theme/variables";
import { WalletStyles } from "../styles/wallet";
import AppHeader from "../ui/AppHeader";

const styles = StyleSheet.create({
  darkGrayBg: {
    backgroundColor: variables.brandDarkGray
  },
  whiteBg: {
    backgroundColor: variables.colorWhite
  },
  noBottomPadding: {
    paddingBottom: 0
  }
});

// card type to be displayed at
// the bottom of the header
export enum CardType {
  NONE, // show no card
  FAN, // "fanned cards" (not really fanned, but you get the idea)
  FULL, // full-sized card
  HEADER // card header (only card number & logo)
}

type Props = Readonly<{
  title: string;
  navigation: NavigationScreenProp<NavigationState>;
  headerContents?: React.ReactNode;
  cardType?: CardType;
  showPayButton?: boolean;
  allowGoBack?: boolean;
}>;

export class WalletLayout extends React.Component<Props> {
  public static defaultProps = {
    headerContents: null,
    cardType: CardType.NONE,
    showPayButton: true,
    allowGoBack: true
  };

  private getLogo(): React.ReactNode {
    switch (this.props.cardType) {
      case CardType.NONE:
      case undefined: {
        // "undefined" is here because cardType is optional, but defaultProps sets it to NONE
        return null;
      }
      case CardType.FAN: {
        return (
          <View style={WalletStyles.container}>
            <TouchableHighlight
              onPress={(): boolean =>
                this.props.navigation.navigate(ROUTES.WALLET_CREDITCARDS)
              }
            >
              <Image
                style={WalletStyles.pfCards}
                source={require("../../../img/wallet/creditcards.jpg")}
              />
            </TouchableHighlight>
          </View>
        );
      }
      case CardType.FULL: {
        return (
          <View style={WalletStyles.container}>
            <Image
              style={{
                height: 120,
                width: "100%",
                bottom: -1,
                resizeMode: "contain"
              }}
              source={require("../../../img/wallet/card-tab.png")}
            />
          </View>
        );
      }
      case CardType.HEADER: {
        return (
          <View style={WalletStyles.container}>
            <Image
              style={{
                height: 55,
                width: "100%",
                bottom: -1,
                resizeMode: "stretch"
              }}
              source={require("../../../img/wallet/single-tab.png")}
            />
          </View>
        );
      }
      default:
        ((): never => this.props.cardType)();
        return null;
    }
  }

  public render(): React.ReactNode {
    return (
      <Container>
        <AppHeader style={styles.darkGrayBg}>
          <Left>
            <Button
              transparent={true}
              onPress={_ => this.props.navigation.goBack()}
            >
              {this.props.allowGoBack && (
                <Icon
                  color={variables.colorWhite}
                  size={variables.iconSize3}
                  name="io-back"
                />
              )}
            </Button>
          </Left>
          <Body>
            <Text style={WalletStyles.white}>{this.props.title}</Text>
          </Body>
        </AppHeader>
        <ScrollView bounces={false} style={styles.whiteBg}>
          <Content
            scrollEnabled={false}
            style={[styles.darkGrayBg, styles.noBottomPadding]}
          >
            {this.props.headerContents}
            {this.getLogo()}
          </Content>
          {this.props.children}
        </ScrollView>
        {this.props.showPayButton && (
          <View footer={true}>
            <Button block={true}>
              <Icon
                name="io-qr"
                color={variables.colorWhite}
                size={variables.iconSize2}
              />
              <Text>{I18n.t("wallet.payNotice")}</Text>
            </Button>
          </View>
        )}
      </Container>
    );
  }
}

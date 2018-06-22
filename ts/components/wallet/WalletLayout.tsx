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
import { Left } from "native-base";
import { Button } from "native-base";
import * as React from "react";
import { ScrollView } from "react-native";
import { Image, StyleSheet, TouchableHighlight } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import variables from "../../theme/variables";
import { CreditCard } from "../../types/CreditCard";
import { WalletStyles } from "../styles/wallet";
import AppHeader from "../ui/AppHeader";
import CreditCardComponent from "./card";
import { LogoPosition } from "./card/Logo";

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
export enum CardEnum {
  NONE, // show no card
  FAN, // "fanned cards" (not really fanned, but you get the idea)
  FULL, // full-sized card
  HEADER // card header (only card number & logo)
}

type FullCard = Readonly<{
  type: CardEnum.FULL;
  card: CreditCard;
}>;

type HeaderCard = Readonly<{
  type: CardEnum.HEADER;
  card: CreditCard;
}>;

type FannedCards = Readonly<{
  type: CardEnum.FAN;
  cards: ReadonlyArray<CreditCard>;
}>;

type NoCards = Readonly<{
  type: CardEnum.NONE;
}>;

export type CardType = FullCard | HeaderCard | FannedCards | NoCards;

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
    cardType: { type: CardEnum.NONE },
    showPayButton: true,
    allowGoBack: true
  };

  private getLogo(): React.ReactNode {
    if (!this.props.cardType) {
      return null;
    }
    switch (this.props.cardType.type) {
      case CardEnum.NONE:
      case undefined: {
        // "undefined" is here because cardType is optional, but defaultProps sets it to NONE
        return null;
      }
      case CardEnum.FAN: {
        return (
          <View style={WalletStyles.container}>
            <TouchableHighlight
              onPress={(): boolean =>
                this.props.navigation.navigate(ROUTES.WALLET_CREDITCARDS)
              }
            >
              <Image
                style={WalletStyles.pfCards}
                source={require("../../../img/wallet/creditcards.png")}
              />
            </TouchableHighlight>
          </View>
        );
      }
      case CardEnum.FULL: {
        return (
          <View style={WalletStyles.container}>
            <CreditCardComponent
              navigation={this.props.navigation}
              item={this.props.cardType.card}
              favorite={false}
              menu={true}
              lastUsage={false}
              flatBottom={true}
            />
          </View>
        );
      }
      case CardEnum.HEADER: {
        return (
          <View style={WalletStyles.container}>
            <CreditCardComponent
              navigation={this.props.navigation}
              item={this.props.cardType.card}
              logoPosition={LogoPosition.TOP}
              flatBottom={true}
              headerOnly={true}
              rotated={true}
            />
          </View>
        );
      }
      default: {
        ((): never => this.props.cardType)();
        return null;
      }
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
                <IconFont
                  name="io-back"
                  style={{
                    color: variables.colorWhite,
                    fontSize: variables.iconSize3
                  }}
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
              <IconFont name="io-qr" style={{ color: variables.colorWhite }} />
              <Text>{I18n.t("wallet.payNotice")}</Text>
            </Button>
          </View>
        )}
      </Container>
    );
  }
}

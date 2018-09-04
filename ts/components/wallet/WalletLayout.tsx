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
import { connect } from "react-redux";

import GoBackButton from "../GoBackButton";
import AppHeader from "../ui/AppHeader";
import IconFont from "../ui/IconFont";
import CardComponent from "./card";
import { LogoPosition } from "./card/Logo";

import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { Dispatch } from "../../store/actions/types";
import { paymentRequestQrCode } from "../../store/actions/wallet/payment";
import variables from "../../theme/variables";
import { Wallet } from "../../types/pagopa";
import { WalletStyles } from "../styles/wallet";

const styles = StyleSheet.create({
  darkGrayBg: {
    backgroundColor: variables.brandDarkGray
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
  card: Wallet;
}>;

type HeaderCard = Readonly<{
  type: CardEnum.HEADER;
  card: Wallet;
}>;

type FannedCards = Readonly<{
  type: CardEnum.FAN;
  cards: ReadonlyArray<Wallet>;
}>;

type NoCards = Readonly<{
  type: CardEnum.NONE;
}>;

export type CardType = FullCard | HeaderCard | FannedCards | NoCards;

type ReduxMappedProps = Readonly<{
  startPayment: () => void;
}>;

type OwnProps = Readonly<{
  title: string;
  navigation: NavigationScreenProp<NavigationState>;
  headerContents?: React.ReactNode;
  cardType?: CardType;
  showPayButton?: boolean;
  allowGoBack?: boolean;
}>;

type Props = OwnProps & ReduxMappedProps;

class WalletLayout extends React.Component<Props> {
  public static defaultProps = {
    headerContents: null,
    cardType: { type: CardEnum.NONE } as NoCards,
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
                this.props.navigation.navigate(ROUTES.WALLET_LIST)
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
            <CardComponent
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
            <CardComponent
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
          {this.props.allowGoBack && (
            <Left>
              <GoBackButton white={true} />
            </Left>
          )}
          <Body>
            <Text style={WalletStyles.white}>{this.props.title}</Text>
          </Body>
        </AppHeader>
        <ScrollView bounces={false} style={WalletStyles.whiteBg}>
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
            <Button block={true} onPress={() => this.props.startPayment()}>
              <IconFont name="io-qr" style={{ color: variables.colorWhite }} />
              <Text>{I18n.t("wallet.payNotice")}</Text>
            </Button>
          </View>
        )}
      </Container>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedProps => ({
  startPayment: () => dispatch(paymentRequestQrCode())
});

export default connect(
  undefined,
  mapDispatchToProps
)(WalletLayout);

import * as React from "react";
import { Image, StyleSheet, TouchableHighlight } from "react-native";
import { Body, Text, Content, View, Container } from 'native-base';
import AppHeader from '../../ui/AppHeader';
import { ScrollView } from 'react-native';
import variables from "../../../theme/variables";
import { NavigationScreenProp, NavigationState } from 'react-navigation';
import { WalletStyles } from '../../styles/wallet';
import { Left } from 'native-base';
import { Button } from 'native-base';
import Icon from "../../../theme/font-icons/io-icon-font";
import ROUTES from '../../../navigation/routes';
import I18n from "../../../i18n";

const styles = StyleSheet.create({
  darkGrayBg: {
    backgroundColor: variables.brandDarkGray
  },
  noTopPadding: {
    paddingTop: 18
  },
  whiteBg: {
    backgroundColor: variables.colorWhite
  },
  noBottomPadding: {
    paddingBottom: 0
  }
});

export enum CardType {
  NONE,
  FAN,
  FULL,
  HEADER
};

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
  headerContents?: React.ReactNode;
  cardType?: CardType;
  showPayButton?: boolean;
}>;

export class WalletLayout extends React.Component<Props> {
  static defaultProps = {
    headerContents: null,
    cardType: CardType.NONE,
    showPayButton: true
  };

  private getLogo(): React.ReactNode {
    switch (this.props.cardType) {
      case CardType.FAN: {
        return (
          <View style={WalletStyles.container}>
            <TouchableHighlight
              onPress={(): boolean => this.props.navigation.navigate(ROUTES.WALLET_CREDITCARDS)}
            >
              <Image
                style={WalletStyles.pfCards}
                source={require("../../../../img/wallet/creditcards.jpg")}
              />
            </TouchableHighlight>
          </View>
        );
      }
      case CardType.FULL: {
        return (
          <View style={WalletStyles.container}>
            <Image
              style={{height: 120, width: "100%", bottom: -1, resizeMode: "contain"}}
              source={require("../../../../img/wallet/card-tab.png")}
            />
          </View>
        );
      }
      case CardType.HEADER: {
        return (
          <View style={WalletStyles.container}>
            <Image
              style={{height: 55, width: "100%", bottom: -1, resizeMode: "stretch"}}
              source={require("../../../../img/wallet/single-tab.png")}
            />
          </View>
        );
      }
    }
    return null;
  }

  public render(): React.ReactNode {
    const showBack = true; // WIP
    return (
      <Container>
        <AppHeader style={[styles.noTopPadding,styles.darkGrayBg]}>
          <Left>
            { showBack ? (
              <Button
                transparent={true}
                onPress={_ => this.props.navigation.goBack()}
              >
                <Icon color={variables.colorWhite} name="io-back" />
              </Button>
            ) : <Button transparent={true}/>
            }
          </Left>
          <Body>
            <Text style={WalletStyles.white}>io.italia.it</Text>
          </Body>
        </AppHeader>
        <ScrollView bounces={false}>
          <Content scrollEnabled={false} style={[styles.darkGrayBg, styles.noBottomPadding]}>
          {this.props.headerContents}
          {this.getLogo()}
          </Content>
          {this.props.children}
        </ScrollView>
        { this.props.showPayButton && (
          <View footer={true}>
            <Button block={true}>
              <Icon name="io-qr" color={variables.colorWhite} size={variables.iconSize2} />
              <Text>{I18n.t("wallet.payNotice")}</Text>
            </Button>
          </View>
        )}
      </Container>
    );
  }
}
/**
 * Layout for the wallet section of the app.
 * This is comprised by a customizable header part
 * (with optionally a card displayed on the bottom
 * of this header), and a customized content on
 * the bottom part of the screen. Both are
 * wrapped in a ScrollView, and optionally a
 * footer with a button for starting a new payment
 */
import {
  Body,
  Button,
  Container,
  Content,
  Left,
  Right,
  Text,
  View
} from "native-base";
import * as React from "react";
import { ScrollView, StyleSheet } from "react-native";

import I18n from "../../i18n";
import variables from "../../theme/variables";
import GoBackButton from "../GoBackButton";
import { InstabugButtons } from "../InstabugButtons";
import AppHeader from "../ui/AppHeader";
import IconFont from "../ui/IconFont";

const styles = StyleSheet.create({
  darkGrayBg: {
    backgroundColor: variables.brandDarkGray
  },

  noalias: {
    marginRight: 0
  },

  white: {
    color: variables.colorWhite
  },

  whiteBg: {
    backgroundColor: variables.colorWhite
  },

  noBottomPadding: {
    padding: variables.contentPadding,
    paddingBottom: 0
  }
});

type Props = Readonly<{
  title: string;
  headerContents?: React.ReactNode;
  onNewPaymentPress?: () => void;
  allowGoBack: boolean;
  displayedWallets?: React.ReactNode;
}>;

export default class WalletLayout extends React.Component<Props> {
  public render(): React.ReactNode {
    return (
      <Container>
        <AppHeader style={styles.darkGrayBg} noLeft={!this.props.allowGoBack}>
          {this.props.allowGoBack && (
            <Left>
              <GoBackButton white={true} style={styles.noalias} />
            </Left>
          )}
          <Body>
            <Text style={styles.white}>{this.props.title}</Text>
          </Body>
          <Right>
            <InstabugButtons color={variables.colorWhite} />
          </Right>
        </AppHeader>

        <ScrollView bounces={false} style={styles.whiteBg}>
          <Content
            scrollEnabled={false}
            style={[styles.darkGrayBg, styles.noBottomPadding]}
          >
            {this.props.headerContents}
            {this.props.displayedWallets}
          </Content>
          {this.props.children}
        </ScrollView>
        {this.props.onNewPaymentPress && (
          <View footer={true}>
            <Button block={true} onPress={this.props.onNewPaymentPress}>
              <IconFont name="io-qr" style={{ color: variables.colorWhite }} />
              <Text>{I18n.t("wallet.payNotice")}</Text>
            </Button>
          </View>
        )}
      </Container>
    );
  }
}

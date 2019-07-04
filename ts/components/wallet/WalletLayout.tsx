/**
 * Layout for the wallet section of the app.
 * This is comprised by a customizable header part
 * (with optionally a card displayed on the bottom
 * of this header), and a customized content on
 * the bottom part of the screen. Both are
 * wrapped in a ScrollView, and optionally a
 * footer with a button for starting a new payment
 */
import I18n from "i18n-js";
import { Text, View } from "native-base";
import * as React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import customVariables from "../../theme/variables";
import AnimatedScreenContent from "../screens/AnimatedScreenContent";
import ScreenContent from "../screens/ScreenContent";
import TopScreenComponent from "../screens/TopScreenComponent";
import H5 from "../ui/H5";
import Markdown from "../ui/Markdown";
import PagoPALogo from "./PagoPALogo";

type Props = Readonly<{
  title: string;
  allowGoBack: boolean;
  hasDynamicSubHeader: boolean;
  topContent?: React.ReactNode;
  hideHeader?: boolean;
  footerContent?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}>;

const styles = StyleSheet.create({
  headerContents: {
    backgroundColor: customVariables.brandDarkGray,
    paddingHorizontal: customVariables.contentPadding
  },

  whiteBg: {
    backgroundColor: customVariables.colorWhite,
    marginBottom: 10
  },

  flex1: {
    flex: 1
  },

  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },

  brandDarkGray: {
    color: customVariables.brandDarkGray
  },

  subHeaderContent: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: customVariables.contentPadding,
    backgroundColor: customVariables.colorWhite
  }
});

export default class WalletLayout extends React.Component<Props> {
  private dynamicSubHeader() {
    return (
      <View style={[styles.whiteBg, styles.flex1, styles.shadow]}>
        <View spacer={true} />
        <View style={styles.subHeaderContent}>
          <H5 style={styles.brandDarkGray}>
            {I18n.t("wallet.latestTransactions")}
          </H5>
          <Text>{I18n.t("wallet.amount")}</Text>
        </View>
        <View spacer={true} />
      </View>
    );
  }

  private screenContent() {
    return (
      <React.Fragment>
        <View style={styles.headerContents}>
          <View spacer={true} />
          {this.props.topContent}
        </View>

        {this.props.children}
      </React.Fragment>
    );
  }

  public render(): React.ReactNode {
    const {
      title,
      allowGoBack,
      hideHeader,
      footerContent,
      contentStyle
    } = this.props;

    return (
      <TopScreenComponent
        goBack={allowGoBack}
        title={title}
        dark={true}
        contextualHelp={{
          title: I18n.t("wallet.wallet"),
          body: () => <Markdown>{I18n.t("wallet.walletHelp")}</Markdown>
        }}
        headerBody={<PagoPALogo />}
      >
        {this.props.hasDynamicSubHeader ? (
          <AnimatedScreenContent
            hideHeader={hideHeader}
            title={title ? title : I18n.t("wallet.wallet")}
            icon={require("../../../img/wallet/bank.png")}
            dark={true}
            contentStyle={contentStyle}
            dynamicSubHeader={this.dynamicSubHeader()}
            topContentHeight={250}
            animationOffset={40}
          >
            {this.screenContent()}
          </AnimatedScreenContent>
        ) : (
          <ScreenContent
            hideHeader={hideHeader}
            title={title ? title : I18n.t("wallet.wallet")}
            icon={require("../../../img/wallet/bank.png")}
            dark={true}
            contentStyle={contentStyle}
          >
            {this.screenContent()}
          </ScreenContent>
        )}

        {footerContent && <View footer={true}>{footerContent}</View>}
      </TopScreenComponent>
    );
  }
}

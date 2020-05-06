/**
 * Layout for the wallet section of the app.
 * This is comprised by a customizable header part
 * (with optionally a card displayed on the bottom
 * of this header), and a customized content on
 * the bottom part of the screen. Both are
 * wrapped in a ScrollView, and optionally a
 * footer with a button for starting a new payment
 */

import { Text, View } from "native-base";
import * as React from "react";
import {
  RefreshControlProps,
  StyleProp,
  StyleSheet,
  ViewStyle
} from "react-native";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import { FAQsCategoriesType } from "../../utils/faq";
import {
  ContextualHelpProps,
  ContextualHelpPropsMarkdown
} from "../screens/BaseScreenComponent";
import DarkLayout from "../screens/DarkLayout";
import H5 from "../ui/H5";
import PagoPALogo from "./PagoPALogo";

type Props = Readonly<{
  title: string;
  allowGoBack: boolean;
  hasDynamicSubHeader: boolean;
  topContent?: React.ReactNode;
  hideHeader?: boolean;
  footerContent?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  contextualHelp?: ContextualHelpProps;
  contextualHelpMarkdown?: ContextualHelpPropsMarkdown;
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
}>;

const styles = StyleSheet.create({
  whiteBg: {
    backgroundColor: customVariables.colorWhite,
    marginBottom: 10
  },

  flex1: {
    flex: 1
  },

  shadow: {
    // iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    zIndex: 999,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android
    elevation: 8,
    borderBottomWidth: 0,
    position: "relative"
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

  public render(): React.ReactNode {
    const {
      title,
      allowGoBack,
      hideHeader,
      footerContent,
      contentStyle
    } = this.props;

    return (
      <DarkLayout
        bounces={false}
        allowGoBack={allowGoBack}
        headerBody={<PagoPALogo />}
        title={title ? title : I18n.t("wallet.wallet")}
        icon={require("../../../img/wallet/bank.png")}
        contentStyle={contentStyle}
        hasDynamicSubHeader={this.props.hasDynamicSubHeader}
        dynamicSubHeader={this.dynamicSubHeader()}
        topContentHeight={250}
        topContent={this.props.topContent}
        hideHeader={hideHeader}
        footerContent={footerContent}
        contextualHelp={this.props.contextualHelp}
        contextualHelpMarkdown={this.props.contextualHelpMarkdown}
        contentRefreshControl={this.props.refreshControl}
        faqCategories={this.props.faqCategories}
      >
        {this.props.children}
      </DarkLayout>
    );
  }
}

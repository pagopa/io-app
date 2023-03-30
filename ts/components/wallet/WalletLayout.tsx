/**
 * Layout for the wallet section of the app.
 * This is comprised by a customizable header part
 * (with optionally a card displayed on the bottom
 * of this header), and a customized content on
 * the bottom part of the screen. Both are
 * wrapped in a ScrollView, and optionally a
 * footer with a button for starting a new payment
 */

import { Content, Text as NBText } from "native-base";
import * as React from "react";
import { View, Animated, StyleProp, StyleSheet, ViewStyle } from "react-native";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import { FAQsCategoriesType } from "../../utils/faq";
import {
  ContextualHelpProps,
  ContextualHelpPropsMarkdown
} from "../screens/BaseScreenComponent";
import DarkLayout from "../screens/DarkLayout";
import { H2 } from "../core/typography/H2";
import { IOColors } from "../core/variables/IOColors";
import { VSpacer } from "../core/spacer/Spacer";
import { ScreenContentRoot } from "../screens/ScreenContent";

type Props = Readonly<{
  accessibilityLabel?: string;
  title: string;
  allowGoBack: boolean;
  topContentHeight?: number;
  hasDynamicSubHeader: boolean;
  topContent?: React.ReactNode;
  hideHeader?: boolean;
  footerContent?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  refreshControl?: Animated.ComponentProps<Content>["refreshControl"];
  contextualHelp?: ContextualHelpProps;
  contextualHelpMarkdown?: ContextualHelpPropsMarkdown;
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
  appLogo?: boolean;
  gradientHeader?: boolean;
  headerPaddingMin?: boolean;
  footerFullWidth?: React.ReactNode;
  referenceToContentScreen?: (
    c: ScreenContentRoot
  ) => ScreenContentRoot | React.LegacyRef<Content>;
}>;

const styles = StyleSheet.create({
  whiteBg: {
    backgroundColor: IOColors.white,
    marginBottom: 10
  },

  flex1: {
    flex: 1
  },

  shadow: {
    // iOS
    shadowColor: IOColors.black,
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

  subHeaderContent: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: customVariables.contentPadding,
    backgroundColor: IOColors.white
  }
});

export default class WalletLayout extends React.Component<Props> {
  private dynamicSubHeader() {
    return (
      <View style={[styles.whiteBg, styles.flex1, styles.shadow]}>
        <VSpacer size={16} />
        <View style={styles.subHeaderContent}>
          <H2 color={"bluegrey"}>{I18n.t("wallet.latestTransactions")}</H2>
          <NBText>{I18n.t("wallet.amount")}</NBText>
        </View>
        <VSpacer size={16} />
      </View>
    );
  }

  public render(): React.ReactNode {
    const {
      title,
      accessibilityLabel,
      allowGoBack,
      hideHeader,
      footerContent,
      contentStyle,
      appLogo,
      footerFullWidth
    } = this.props;

    return (
      <DarkLayout
        accessibilityLabel={accessibilityLabel}
        bounces={false}
        allowGoBack={allowGoBack}
        title={title ? title : I18n.t("wallet.wallet")}
        iconFont={{ name: "io-pagopa" }}
        appLogo={appLogo}
        contentStyle={contentStyle}
        hasDynamicSubHeader={this.props.hasDynamicSubHeader}
        dynamicSubHeader={this.dynamicSubHeader()}
        topContentHeight={this.props.topContentHeight}
        topContent={this.props.topContent}
        hideHeader={hideHeader}
        footerContent={footerContent}
        footerFullWidth={footerFullWidth}
        contextualHelp={this.props.contextualHelp}
        contextualHelpMarkdown={this.props.contextualHelpMarkdown}
        faqCategories={this.props.faqCategories}
        gradientHeader={this.props.gradientHeader}
        headerPaddingMin={this.props.headerPaddingMin}
        referenceToContentScreen={this.props.referenceToContentScreen}
      >
        {this.props.children}
      </DarkLayout>
    );
  }
}

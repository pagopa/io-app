/**
 * Layout for the wallet section of the app.
 * This is comprised by a customizable header part
 * (with optionally a card displayed on the bottom
 * of this header), and a customized content on
 * the bottom part of the screen. Both are
 * wrapped in a ScrollView, and optionally a
 * footer with a button for starting a new payment
 */

import { Content } from "native-base";
import * as React from "react";
import { Animated, StyleProp, ViewStyle } from "react-native";
import I18n from "../../i18n";
import { FAQsCategoriesType } from "../../utils/faq";
import {
  ContextualHelpProps,
  ContextualHelpPropsMarkdown
} from "../screens/BaseScreenComponent";
import DarkLayout from "../screens/DarkLayout";

import { ScreenContentRoot } from "../screens/ScreenContent";

type Props = Readonly<{
  accessibilityLabel?: string;
  title: string;
  allowGoBack: boolean;
  topContentHeight?: number;
  topContent?: React.ReactNode;
  hideHeader?: boolean;
  hideBaseHeader?: boolean;
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

export default class WalletLayout extends React.Component<Props> {
  public render(): React.ReactNode {
    const {
      title,
      accessibilityLabel,
      allowGoBack,
      hideHeader,
      hideBaseHeader = false,
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
        appLogo={appLogo}
        contentStyle={contentStyle}
        topContentHeight={this.props.topContentHeight}
        topContent={this.props.topContent}
        hideHeader={hideHeader}
        hideBaseHeader={hideBaseHeader}
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

/**
 * Layout for the wallet section of the app.
 * This is comprised by a customizable header part
 * (with optionally a card displayed on the bottom
 * of this header), and a customized content on
 * the bottom part of the screen. Both are
 * wrapped in a ScrollView, and optionally a
 * footer with a button for starting a new payment
 */

import * as React from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleProp,
  View,
  ViewStyle
} from "react-native";
import { IOColors } from "@pagopa/io-app-design-system";
import I18n from "../../i18n";
import { FAQsCategoriesType } from "../../utils/faq";
import {
  ContextualHelpProps,
  ContextualHelpPropsMarkdown
} from "../screens/BaseScreenComponent";
import DarkLayout from "../screens/DarkLayout";

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
  refreshControl?: Animated.ComponentProps<ScrollView>["refreshControl"];
  contextualHelp?: ContextualHelpProps;
  contextualHelpMarkdown?: ContextualHelpPropsMarkdown;
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
  appLogo?: boolean;
  gradientHeader?: boolean;
  headerPaddingMin?: boolean;
  footerFullWidth?: React.ReactNode;
  referenceToContentScreen?: React.RefObject<ScrollView>;
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

    /* The dimensions of the screen that will be used
    to hide the white background when inertial
    scrolling is turned on. */
    const { height: screenHeight, width: screenWidth } =
      Dimensions.get("screen");

    return (
      <DarkLayout
        accessibilityLabel={accessibilityLabel}
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
        {/* Add a fake View with a dark background to hide
            the white block when the inertial scroll is enabled
            (that means the user is using negative scroll values) */}
        <View
          style={{
            position: "absolute",
            top: -screenHeight,
            height: screenHeight,
            width: screenWidth,
            backgroundColor: IOColors.bluegrey
          }}
        />
        {/* End of the hacky solution */}

        {this.props.children}
      </DarkLayout>
    );
  }
}

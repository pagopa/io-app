/**
 * A component to display a bluegrey background color on the screen using it
 */
import { View } from "native-base";
import * as React from "react";
import {
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  ViewStyle
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { IconProps } from "react-native-vector-icons/Icon";
import FocusAwareStatusBar from "../../components/ui/FocusAwareStatusBar";
import customVariables from "../../theme/variables";
import { FAQsCategoriesType } from "../../utils/faq";
import { VSpacer } from "../core/spacer/Spacer";
import { IOColors, getGradientColorValues } from "../core/variables/IOColors";
import AnimatedScreenContent from "./AnimatedScreenContent";
import {
  ContextualHelpProps,
  ContextualHelpPropsMarkdown
} from "./BaseScreenComponent";
import ScreenContent from "./ScreenContent";
import TopScreenComponent from "./TopScreenComponent";

type Props = Readonly<{
  accessibilityLabel?: string;
  allowGoBack?: boolean;
  headerBody?: React.ReactNode;
  title?: string;
  icon?: ImageSourcePropType;
  iconFont?: IconProps;
  hideHeader?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  appLogo?: boolean;
  bounces?: boolean;
  topContent?: React.ReactNode;
  hasDynamicSubHeader?: boolean;
  dynamicSubHeader?: React.ReactNode;
  topContentHeight?: number;
  footerContent?: React.ReactNode;
  contextualHelp?: ContextualHelpProps;
  contextualHelpMarkdown?: ContextualHelpPropsMarkdown;
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
  customGoBack?: React.ReactNode;
  gradientHeader?: boolean;
  headerPaddingMin?: boolean;
  footerFullWidth?: React.ReactNode;
}>;

const styles = StyleSheet.create({
  headerContents: {
    paddingHorizontal: customVariables.contentPadding
  },
  headerContentsMin: {
    paddingHorizontal: 16
  }
});

export default class DarkLayout extends React.Component<Props> {
  screenContent() {
    const wrapper = (children: React.ReactNode) =>
      this.props.gradientHeader ? (
        <LinearGradient
          colors={getGradientColorValues("grey")}
          style={
            this.props.headerPaddingMin
              ? styles.headerContentsMin
              : styles.headerContents
          }
        >
          {children}
        </LinearGradient>
      ) : (
        <View
          style={[
            this.props.headerPaddingMin
              ? styles.headerContentsMin
              : styles.headerContents,
            { backgroundColor: IOColors.bluegrey }
          ]}
        >
          {children}
        </View>
      );
    return (
      <React.Fragment>
        {wrapper(
          <React.Fragment>
            <VSpacer size={16} />
            {this.props.topContent}
          </React.Fragment>
        )}
        {this.props.children}
      </React.Fragment>
    );
  }
  public render() {
    return (
      <TopScreenComponent
        accessibilityLabel={this.props.accessibilityLabel}
        goBack={this.props.allowGoBack}
        customGoBack={this.props.customGoBack}
        headerTitle={this.props.title ? this.props.title : ""}
        dark={true}
        headerBody={this.props.headerBody}
        appLogo={this.props.appLogo}
        contextualHelp={this.props.contextualHelp}
        contextualHelpMarkdown={this.props.contextualHelpMarkdown}
        faqCategories={this.props.faqCategories}
        titleColor={"white"}
      >
        <FocusAwareStatusBar
          backgroundColor={IOColors.bluegrey}
          barStyle={"light-content"}
        />
        {this.props.hasDynamicSubHeader ? (
          <AnimatedScreenContent
            hideHeader={this.props.hideHeader}
            title={this.props.title ? this.props.title : ""}
            icon={this.props.icon}
            iconFont={this.props.iconFont}
            dark={true}
            contentStyle={this.props.contentStyle}
            dynamicSubHeader={this.props.dynamicSubHeader}
            topContentHeight={
              this.props.topContentHeight ? this.props.topContentHeight : 0
            }
            animationOffset={40}
          >
            {this.screenContent()}
          </AnimatedScreenContent>
        ) : (
          <ScreenContent
            hideHeader={this.props.hideHeader}
            title={this.props.title ? this.props.title : ""}
            icon={this.props.icon}
            iconFont={this.props.iconFont}
            dark={true}
            contentStyle={this.props.contentStyle}
            bounces={this.props.bounces}
          >
            {this.screenContent()}
          </ScreenContent>
        )}
        {this.props.footerFullWidth}
        {this.props.footerContent && (
          <View footer={true}>{this.props.footerContent}</View>
        )}
      </TopScreenComponent>
    );
  }
}

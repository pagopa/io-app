/**
 * A component to display a bluegrey background color on the screen using it
 */
import * as React from "react";
import {
  View,
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  ViewStyle,
  ScrollView
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {
  IOColors,
  IOIcons,
  getGradientColorValues
} from "@pagopa/io-app-design-system";
import FocusAwareStatusBar from "../../components/ui/FocusAwareStatusBar";
import customVariables from "../../theme/variables";
import { FAQsCategoriesType } from "../../utils/faq";
import { IOStyles } from "../core/variables/IOStyles";
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
  rasterIcon?: ImageSourcePropType;
  icon?: IOIcons;
  hideHeader?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  appLogo?: boolean;
  bounces?: boolean;
  hideBaseHeader?: boolean;
  topContent?: React.ReactNode;
  topContentHeight?: number;
  footerContent?: React.ReactNode;
  contextualHelp?: ContextualHelpProps;
  contextualHelpMarkdown?: ContextualHelpPropsMarkdown;
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
  customGoBack?: React.ReactNode;
  gradientHeader?: boolean;
  headerPaddingMin?: boolean;
  footerFullWidth?: React.ReactNode;
  referenceToContentScreen?: React.RefObject<ScrollView>;
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
        {wrapper(<React.Fragment>{this.props.topContent}</React.Fragment>)}
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
        hideBaseHeader={!!this.props.hideBaseHeader}
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
        <ScreenContent
          hideHeader={this.props.hideHeader}
          title={this.props.title ? this.props.title : ""}
          rasterIcon={this.props.rasterIcon}
          icon={this.props.icon}
          dark={true}
          contentStyle={this.props.contentStyle}
          bounces={this.props.bounces}
          referenceToContentScreen={this.props.referenceToContentScreen}
        >
          {this.screenContent()}
        </ScreenContent>

        {this.props.footerFullWidth}
        {this.props.footerContent && (
          <View style={IOStyles.footer}>{this.props.footerContent}</View>
        )}
      </TopScreenComponent>
    );
  }
}

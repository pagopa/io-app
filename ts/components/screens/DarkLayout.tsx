/**
 * A component to display a brandDarkGray background color on the screen using it
 */
import { View } from "native-base";
import * as React from "react";
import {
  ImageSourcePropType,
  RefreshControlProps,
  StyleProp,
  ViewStyle
} from "react-native";
import { StyleSheet } from "react-native";
import { IconProps } from "react-native-vector-icons/Icon";
import customVariables from "../../theme/variables";
import { FAQsCategoriesType } from "../../utils/faq";
import { setStatusBarColorAndBackground } from "../../utils/statusBar";
import AnimatedScreenContent from "./AnimatedScreenContent";
import {
  ContextualHelpProps,
  ContextualHelpPropsMarkdown
} from "./BaseScreenComponent";
import ScreenContent from "./ScreenContent";
import TopScreenComponent from "./TopScreenComponent";
import LinearGradient from "react-native-linear-gradient";

type Props = Readonly<{
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
  contentRefreshControl?: React.ReactElement<RefreshControlProps>;
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
  customGoBack?: React.ReactNode;
  gradientHeader?: boolean;
}>;

const styles = StyleSheet.create({
  headerContents: {
    paddingHorizontal: customVariables.contentPadding
  }
});

export default class DarkLayout extends React.Component<Props> {
  public componentDidMount() {
    setStatusBarColorAndBackground(
      "light-content",
      customVariables.brandDarkGray
    );
  }

  private screenContent() {
    return this.props.gradientHeader ? (
      <React.Fragment>
        <LinearGradient
          colors={[customVariables.brandDarkGray, "#42484F"]}
          style={styles.headerContents}
        >
          <View spacer={true} />
          {this.props.topContent}
        </LinearGradient>
        {this.props.children}
      </React.Fragment>
    ) : (
      <React.Fragment>
        <View
          style={[
            styles.headerContents,
            { backgroundColor: customVariables.brandDarkGray }
          ]}
        >
          <View spacer={true} />
          {this.props.topContent}
        </View>
        {this.props.children}
      </React.Fragment>
    );
  }
  public render() {
    return (
      <TopScreenComponent
        goBack={this.props.allowGoBack}
        customGoBack={this.props.customGoBack}
        headerTitle={this.props.title ? this.props.title : ""}
        dark={true}
        headerBody={this.props.headerBody}
        appLogo={this.props.appLogo}
        contextualHelp={this.props.contextualHelp}
        contextualHelpMarkdown={this.props.contextualHelpMarkdown}
        faqCategories={this.props.faqCategories}
      >
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
            contentRefreshControl={this.props.contentRefreshControl}
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
            bounces={
              this.props.bounces ||
              this.props.contentRefreshControl !== undefined
            }
            contentRefreshControl={this.props.contentRefreshControl}
          >
            {this.screenContent()}
          </ScreenContent>
        )}
        {this.props.footerContent && (
          <View footer={true}>{this.props.footerContent}</View>
        )}
      </TopScreenComponent>
    );
  }
}

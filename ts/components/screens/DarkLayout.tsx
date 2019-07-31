import { View } from "native-base";
import * as React from "react";
import {
  ImageSourcePropType,
  StatusBar,
  StyleProp,
  ViewStyle
} from "react-native";
import { StyleSheet } from "react-native";
import customVariables from "../../theme/variables";
import AnimatedScreenContent from "./AnimatedScreenContent";
import ScreenContent from "./ScreenContent";
import TopScreenComponent from "./TopScreenComponent";

type Props = Readonly<{
  allowGoBack?: boolean;
  headerBody?: React.ReactNode;
  title?: string;
  icon?: ImageSourcePropType;
  hideHeader?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  appLogo?: boolean;
  bounces?: boolean;
  topContent?: React.ReactNode;
  hasDynamicSubHeader?: boolean;
  dynamicSubHeader?: React.ReactNode;
  topContentHeight?: number;
  footerContent?: React.ReactNode;
  contextualHelp?: { title: string; body: () => React.ReactNode };
  banner?: React.ReactNode;
}>;

const styles = StyleSheet.create({
  headerContents: {
    backgroundColor: customVariables.brandDarkGray,
    paddingHorizontal: customVariables.contentPadding
  }
});

export default class DarkLayout extends React.Component<Props> {
  private screenContent() {
    const { banner } = this.props;
    return (
      <React.Fragment>
        <View style={styles.headerContents}>
          <View spacer={true} />
          {this.props.topContent}
        </View>
        {banner}
        {this.props.children}
      </React.Fragment>
    );
  }
  public render() {
    return (
      <TopScreenComponent
        goBack={this.props.allowGoBack}
        title={this.props.title ? this.props.title : ""}
        dark={true}
        headerBody={this.props.headerBody}
        appLogo={this.props.appLogo}
        contextualHelp={this.props.contextualHelp}
      >
        <StatusBar
          backgroundColor={customVariables.brandDarkGray}
          barStyle={"light-content"}
        />

        {this.props.hasDynamicSubHeader ? (
          <AnimatedScreenContent
            hideHeader={this.props.hideHeader}
            title={this.props.title ? this.props.title : ""}
            icon={this.props.icon}
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
            dark={true}
            contentStyle={this.props.contentStyle}
            bounces={this.props.bounces}
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

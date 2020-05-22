/**
 * A component to display a brandDarkGray background color on the screen using it
 */
import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import customVariables from "../../theme/variables";
import AnimatedScreenContent from "./AnimatedScreenContent";
import BaseScreenComponent from "./BaseScreenComponent";
import ScreenContent from "./ScreenContent";

type OwnProps = Readonly<{
  hasDynamicSubHeader?: boolean;
  topContent?: React.ReactNode;
  hideHeader?: boolean;
  dynamicSubHeader?: React.ReactNode;
  topContentHeight?: number;
  footerContent?: React.ReactNode;
}>;

type Props = OwnProps &
  React.ComponentProps<typeof BaseScreenComponent> &
  React.ComponentProps<typeof ScreenContent>;

const styles = StyleSheet.create({
  headerContents: {
    backgroundColor: customVariables.brandDarkGray,
    paddingHorizontal: customVariables.contentPadding
  }
});

export default class DarkLayout extends React.Component<Props> {
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
  public render() {
    return (
      <BaseScreenComponent
        goBack={this.props.goBack}
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
      </BaseScreenComponent>
    );
  }
}

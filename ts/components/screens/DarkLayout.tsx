import { View } from "native-base";
import * as React from "react";
import { ImageSourcePropType, StyleProp, ViewStyle } from "react-native";
import { StyleSheet } from "react-native";
import customVariables from "../../theme/variables";
import ScreenContent from "./ScreenContent";
import TopScreenComponent from "./TopScreenComponent";

type Props = Readonly<{
  allowGoBack: boolean;
  headerBody: React.ReactNode;
  title: string;
  icon: ImageSourcePropType;
  hideHeader?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  appLogo?: boolean;
  bounces?: boolean;
  topContent?: React.ReactNode;
  hasDynamicSubHeader?: boolean;
}>;

const styles = StyleSheet.create({
  headerContents: {
    backgroundColor: customVariables.brandDarkGray,
    paddingHorizontal: customVariables.contentPadding
  }
});

export default class DarkLayout extends React.Component<Props> {
  public render() {
    const { title } = this.props;
    return (
      <TopScreenComponent
        goBack={this.props.allowGoBack}
        title={this.props.title}
        dark={true}
        headerBody={this.props.headerBody}
        appLogo={this.props.appLogo}
      >
        <ScreenContent
          hideHeader={this.props.hideHeader}
          title={title}
          icon={this.props.icon}
          dark={true}
          contentStyle={this.props.contentStyle}
          bounces={this.props.bounces}
        >
          <View style={styles.headerContents}>
            <View spacer={true} />
            {this.props.topContent}
          </View>
          {this.props.children}
        </ScreenContent>
      </TopScreenComponent>
    );
  }
}

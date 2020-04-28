/**
 * This component shows a contextual help
 * that provides additional information when
 * needed (e.g. ToS, explaining why fees are
 * needed)
 */

import { Content, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import customVariables from "../theme/variables";
import BaseScreenComponent from "./screens/BaseScreenComponent";
import { ScreenContentHeader } from "./screens/ScreenContentHeader";

type Props = Readonly<{
  title: string;
  body: () => React.ReactNode;
  onClose: () => void;
}>;

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: customVariables.contentPadding
  }
});

export class ContextualHelp extends React.Component<Props> {
  public render(): React.ReactNode {
    return (
      <BaseScreenComponent
        isModal={true}
        handleHardwareBack={true}
        customRightBack={{ iconName: "io-close", onPress: this.props.onClose }}
      >
        <Content noPadded={true}>
          <ScreenContentHeader title={this.props.title} />
          <View style={styles.padded}>{this.props.body()}</View>
        </Content>
      </BaseScreenComponent>
    );
  }
}

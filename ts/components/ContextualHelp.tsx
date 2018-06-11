/**
 * This component shows a contextual help
 * that provides additional information when
 * needed (e.g. ToS, explaining why fees are
 * needed)
 */

import { Content, H1, Text, View } from "native-base";
import * as React from "react";
import { TouchableHighlight } from "react-native";
import Icon from "../theme/font-icons/io-icon-font/index";
import variables from "../theme/variables";
import Modal from "./ui/Modal";

type Props = Readonly<{
  title: string;
  body: string;
  isVisible: boolean;
  close: () => void;
}>;

export class ContextualHelp extends React.Component<Props> {
  public render(): React.ReactNode {
    return (
      <Modal isVisible={this.props.isVisible} fullscreen={true}>
        <View header={true}>
          <TouchableHighlight onPress={_ => this.props.close()}>
            <Icon name="io-close" size={variables.iconSizeBase} />
          </TouchableHighlight>
        </View>
        <Content>
          <H1>{this.props.title}</H1>
          <View spacer={true} large={true} />
          <Text>{this.props.body}</Text>
        </Content>
      </Modal>
    );
  }
}

/**
 * This component shows a contextual help
 * that provides additional information when
 * needed (e.g. ToS, explaining why fees are
 * needed)
 */

import { Content, H1, Icon, Text, View } from "native-base";
import * as React from "react";
import Modal from "./ui/Modal";

type Props = Readonly<{
  title: string;
  body: string;
  show: boolean;
  close: () => void;
}>;

export class ContextualHelp extends React.Component<Props> {
  public render(): React.ReactNode {
    return (
      <Modal isVisible={this.props.show} fullscreen={true}>
        <View header={true}>
          <Icon name="cross" onPress={_ => this.props.close()} />
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

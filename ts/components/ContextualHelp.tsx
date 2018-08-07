/**
 * This component shows a contextual help
 * that provides additional information when
 * needed (e.g. ToS, explaining why fees are
 * needed)
 */

import { Content, H1, View } from "native-base";
import * as React from "react";
import { TouchableHighlight } from "react-native";
import IconFont from "../components/ui/IconFont";
import Modal from "./ui/Modal";

type Props = Readonly<{
  title: string;
  body: React.ReactNode;
  isVisible: boolean;
  close: () => void;
}>;

export const ContextualHelp: React.SFC<Props> = props => (
  <Modal isVisible={props.isVisible} fullscreen={true}>
    <View header={true}>
      <TouchableHighlight onPress={_ => props.close()}>
        <IconFont name="io-close" />
      </TouchableHighlight>
    </View>
    <Content>
      <H1>{props.title}</H1>
      <View spacer={true} large={true} />
      {props.body}
    </Content>
  </Modal>
);

import { View } from "native-base";
import React from "react";
import { Modal, Text } from "react-native";

export default class ServicesStatusModal extends React.Component {
  public render() {
    return (
      <Modal>
        <View style={{ flex: 1 }}>
          <Text>{"test"}</Text>
        </View>
      </Modal>
    );
  }
}

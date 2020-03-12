import { View } from "native-base";
import React from "react";
import { Modal, Text } from "react-native";
import { connect } from "react-redux";
import { backendServicesStatusSelector } from "./store/reducers/backendServiceStatus";
import { GlobalState } from "./store/reducers/types";

type Props = ReturnType<typeof mapStateToProps>;

class ServicesStatusModal extends React.Component<Props> {
  public render() {
    const isModalVisible = this.props.maybeServicesStatus
      .map(ss => ss.status !== "ok")
      .getOrElse(false);
    return (
      <Modal visible={isModalVisible}>
        <View style={{ flex: 1, backgroundColor: "red" }}>
          <Text>{"ciao"}</Text>
        </View>
      </Modal>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  maybeServicesStatus: backendServicesStatusSelector(state)
});

export default connect(mapStateToProps)(ServicesStatusModal);

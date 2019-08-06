import * as React from "react";
import { TouchableOpacity } from "react-native";

class TouchableWithoutOpacity extends TouchableOpacity {
  public render() {
    return <TouchableOpacity {...this.props} activeOpacity={1} />;
  }
}

export default TouchableWithoutOpacity;

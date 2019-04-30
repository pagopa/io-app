import React from "react";
import { IconProps } from "react-native-vector-icons/Icon";

import customVariables from "../../theme/variables";
import IconFont from "../ui/IconFont";

type Props = {
  isRead: boolean;
  iconStyle?: IconProps["style"];
};

class MessageReadStatusIcon extends React.PureComponent<Props> {
  public render() {
    const { isRead, iconStyle } = this.props;

    // When status is read we don't want to render anything
    if (isRead) {
      return null;
    }

    return (
      <IconFont
        name="io-new"
        color={customVariables.contentPrimaryBackground}
        size={24}
        style={iconStyle}
      />
    );
  }
}

export default MessageReadStatusIcon;

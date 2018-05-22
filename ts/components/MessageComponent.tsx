import * as React from "react";

import { Icon, Item, Text, View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/Utils/mapPropsToStyleNames";
import { Theme } from "../theme/types";

export type OwnProps = {
  sender: string;
  subject: string;
  key: string;
  date: string;
  style: Theme;
};

export type Props = OwnProps;

/**
 * Implements a component that show a message in the MessagesScreen List
 */
class MessageComponent extends React.Component<Props> {
  public render() {
    const { subject, sender, date } = this.props;
    const styles = this.props.style;

    return (
      <Item spacer={true} style={styles}>
        <View>
          <Text leftAlign={true} bold={true}>
            {sender}
          </Text>
          <Text rightAlign={true} dateFormat={true}>
            {date}
          </Text>
        </View>
        <View messageSubjectContainer={true}>
          <Text leftAlign={true}>{subject}</Text>
          <Icon rightArrow={true} name="chevron-right" />
        </View>
      </Item>
    );
  }
}

const StyledMessageComponent = connectStyle(
  "NativeBase.MessageComponent",
  {},
  mapPropsToStyleNames
)(MessageComponent);
export default StyledMessageComponent;

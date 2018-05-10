import * as React from "react";
import { Item, Text, View, Icon } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import { Theme } from "../theme/types";
import mapPropsToStyleNames from "native-base/src/Utils/mapPropsToStyleNames";

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
class MessageComponent extends React.PureComponent<Props> {
  render() {
    const { subject, sender, date } = this.props;
    const styles = this.props.style;

    return (
      <Item spacer style={styles}>
        <View>
          <Text leftAlign bold>
            {sender}
          </Text>
          <Text rightAlign dateFormat>
            {date}
          </Text>
        </View>
        <View messageSubjectContainer>
          <Text leftAlign>{subject}</Text>
          <Icon rightArrow name="chevron-right" />
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

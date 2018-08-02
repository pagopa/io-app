import { H3, Left, ListItem, Right, Text } from "native-base";
import * as React from "react";

import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";

import IconFont from "../components/ui/IconFont";
import variables from "../theme/variables";

interface BaseProps {
  title: string;
  valuePreview: string;
}

interface ValueProps extends BaseProps {
  kind: "value";
  icon: string;
}

interface ActionProps extends BaseProps {
  kind: "action";
  onClick: () => void;
}

export type Props = ValueProps | ActionProps;

/**
 * Renders a single item in the preferences screen
 */
class PreferenceItem extends React.Component<Props> {
  public render() {
    const props = this.props;
    // tslint:disable-next-line:no-empty
    const onClick = props.kind === "action" ? props.onClick : undefined;
    return (
      <ListItem onPress={onClick}>
        <Left>
          <H3>{props.title}</H3>
          <Text>{props.valuePreview}</Text>
        </Left>
        <Right>
          {props.kind === "value" ? (
            <IconFont name={props.icon} size={variables.iconSize6} />
          ) : props.kind === "action" ? (
            <IconFont name="io-right" />
          ) : null}
        </Right>
      </ListItem>
    );
  }
}

export default connectStyle(
  "UIComponent.PreferenceItem",
  {},
  mapPropsToStyleNames
)(PreferenceItem);

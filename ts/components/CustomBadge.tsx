/**
 * A component to render the circolar badge
 * TODO: use the same component on all lists (messages, services, transaction)
 */
import * as React from "react";
import { Circle, Svg } from "react-native-svg";
import customVariables from "../theme/variables";

export class CustomBadge extends React.PureComponent<{}> {
  public render() {
    return (
      <Svg width={14} height={18}>
        <Circle
          cx="50%"
          cy="50%"
          r={14 / 2}
          fill={customVariables.contentPrimaryBackground}
        />
      </Svg>
    );
  }
}

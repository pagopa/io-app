/**
 * A component to render the circolar badge
 * TODO: use the same component on all lists (messages, services, transaction): https://www.pivotaltracker.com/story/show/167064275
 */
import * as React from "react";
import { Circle, Svg } from "react-native-svg";
import customVariables from "../../theme/variables";

const badgeWidth = 10;

type Props = {
  color?: string;
};

export class BadgeComponent extends React.PureComponent<Props> {
  public render() {
    return (
      <Svg width={badgeWidth} height={badgeWidth}>
        <Circle
          cx={"50%"}
          cy={"50%"}
          r={badgeWidth / 2}
          fill={
            this.props.color
              ? this.props.color
              : customVariables.contentPrimaryBackground
          }
        />
      </Svg>
    );
  }
}

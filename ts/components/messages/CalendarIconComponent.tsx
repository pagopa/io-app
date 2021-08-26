import * as React from "react";
import { G, Path, Svg, Text } from "react-native-svg";

type Props = {
  month: string;
  day: string;
  backgroundColor: string;
  textColor: string;
  small?: boolean;
};

class CalendarIconComponent extends React.PureComponent<Props, never> {
  get dimension(): number {
    return this.props.small ? 32 : 40;
  }

  public render() {
    const { month, day, backgroundColor, textColor } = this.props;
    return (
      <Svg height={this.dimension} width={this.dimension} viewBox={"0 0 40 40"}>
        <G id={"calendar"}>
          <Path
            d={
              "m 33,0 h 3 c 2.209139,0 4,1.790861 4,4 v 32 c 0,2.209139 -1.790861,4 -4,4 H 4 C 1.790861,40 0,38.209139 0,36 V 4 C 0,1.790861 1.790861,0 4,0 h 3 v 3 h 4 V 0 h 18 v 3 h 4 z"
            }
            id={"icon"}
            fill={backgroundColor}
          />
          <Text
            textAnchor={"middle"}
            alignmentBaseline={"central"}
            x={"50%"}
            y={"30%"}
            fill={textColor}
            fontSize={10}
          >
            {month}
          </Text>
          <Text
            textAnchor={"middle"}
            alignmentBaseline={"central"}
            x={"50%"}
            y={"65%"}
            fill={textColor}
            fontSize={18}
            fontWeight={"bold"}
          >
            {day}
          </Text>
        </G>
      </Svg>
    );
  }
}

export default CalendarIconComponent;

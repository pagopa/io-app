import { View } from "react-native";
import * as React from "react";
import Slider from "@react-native-community/slider";
import { H5 } from "../../../../../../components/core/typography/H5";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import I18n from "../../../../../../i18n";

type Props = {
  disabled: boolean;
  value: number;
  onValueChange: (value: number) => void;
};

const MAX_VALUE = 40;
const MIN_VALUE = 1;

// Component used to filter the available CGN Merchants based on distance from a selected point
export const DistanceSlider = (props: Props) => (
  <>
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <H5 weight={"Regular"} color={"bluegrey"}>
        {I18n.t("bonus.cgn.merchantsList.filter.sliderLabel")}
      </H5>
      <H5 weight={"Regular"} color={"grey"}>
        {`${props.value} ${I18n.t(
          "bonus.cgn.merchantsList.filter.sliderUnit"
        )}`}
      </H5>
    </View>
    <Slider
      style={{ width: "100%" }}
      disabled={props.disabled}
      minimumValue={MIN_VALUE}
      maximumValue={MAX_VALUE}
      value={props.value}
      step={1}
      onValueChange={props.onValueChange}
      minimumTrackTintColor={
        props.disabled ? IOColors.bluegreyDark : IOColors.blue
      }
      maximumTrackTintColor={IOColors.grey}
    />
  </>
);

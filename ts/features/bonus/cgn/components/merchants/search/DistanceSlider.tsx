import { View } from "react-native";
import { SliderComponent } from "@react-native-community/slider";
import { H6, IOColors } from "@pagopa/io-app-design-system";
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
      <H6 color={"bluegrey"}>
        {I18n.t("bonus.cgn.merchantsList.filter.sliderLabel")}
      </H6>
      <H6 color={"grey-450"}>
        {`${props.value} ${I18n.t(
          "bonus.cgn.merchantsList.filter.sliderUnit"
        )}`}
      </H6>
    </View>
    <SliderComponent
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
      maximumTrackTintColor={IOColors["grey-450"]}
    />
  </>
);

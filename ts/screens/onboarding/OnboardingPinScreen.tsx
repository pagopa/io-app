import * as React from "react";
import PinSelectionComponent from "../../components/PinSelectionComponent";
import {
  AppParamsList,
  IOStackNavigationRouteProps
} from "../../navigation/params/AppParamsList";

type Props = IOStackNavigationRouteProps<AppParamsList>;

/**
 * A screen that allows the user to set the unlock code.
 */
const PinScreen = ({ navigation }: Props) => (
  <PinSelectionComponent navigation={navigation} isOnboarding={true} />
);

export default PinScreen;

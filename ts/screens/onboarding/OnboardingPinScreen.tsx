import * as React from "react";
import {
  AppParamsList,
  IOStackNavigationRouteProps
} from "../../navigation/params/AppParamsList";
import PinSelectionWrapper from "../../components/PinSelectionWrapper";
import { PinCreation } from "../../components/PinCreation";

type Props = IOStackNavigationRouteProps<AppParamsList>;

/**
 * A screen that allows the user to set the unlock code.
 */
const OnboardingPinScreen = ({ navigation }: Props) => (
  <PinSelectionWrapper navigation={navigation} isOnboarding>
    <PinCreation isOnboarding />
  </PinSelectionWrapper>
);

export default OnboardingPinScreen;

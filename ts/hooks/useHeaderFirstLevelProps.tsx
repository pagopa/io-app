import {
  AlertEdgeToEdgeProps,
  HeaderActionProps
} from "@pagopa/io-app-design-system";
import { MainTabParamsList } from "../navigation/params/MainTabParamsList";
import { useHeaderFirstLevelActionPropHelp } from "./useHeaderFirstLevelActionPropHelp";
import { useHeaderFirstLevelActionPropSettings } from "./useHeaderFirstLevelActionPropSettings";
import { useStatusAlertProps } from "./useStatusAlertProps";

type useHeaderFirstLevelProps = {
  actionHelp: HeaderActionProps;
  actionSettings: HeaderActionProps;
  alertProps?: AlertEdgeToEdgeProps;
};

/**
 * This hook returns common props for the `HeaderFirstLevel`
 */
export const useHeaderFirstLevelProps = (
  currentRouteName: keyof MainTabParamsList
): useHeaderFirstLevelProps => {
  const actionHelp = useHeaderFirstLevelActionPropHelp(currentRouteName);
  const actionSettings = useHeaderFirstLevelActionPropSettings();
  const alertProps = useStatusAlertProps(currentRouteName);

  return {
    actionHelp,
    actionSettings,
    alertProps
  };
};

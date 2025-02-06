import {
  HeaderActionProps,
  HeaderFirstLevel
} from "@pagopa/io-app-design-system";
import { useLayoutEffect, useMemo } from "react";
import { useIONavigation } from "../navigation/params/AppParamsList";
import { MainTabParamsList } from "../navigation/params/MainTabParamsList";
import { useHeaderFirstLevelActionPropHelp } from "./useHeaderFirstLevelActionPropHelp";
import { useHeaderFirstLevelActionPropSettings } from "./useHeaderFirstLevelActionPropSettings";
import { useStatusAlertProps } from "./useStatusAlertProps";

type useHeaderFirstLevelProps = {
  currentRoute: keyof MainTabParamsList;
  headerProps: HeaderFirstLevelHookProps;
};

/* `firstAction` and `ignoreSafeAreaMargin` are
already managed by the hook, while `secondAction`
has a default behaviour but can be overridden
(as in `ServicesHomeScreen') */
type HeaderFirstLevelHookProps = Omit<
  HeaderFirstLevel,
  "ignoreSafeAreaMargin" | "actions"
> & {
  actions?: Array<HeaderActionProps>;
};

/**
 * This hook sets the `HeaderFirstLevel` in a screen using the `useLayoutEffect` hook.
 */
export const useHeaderFirstLevel = ({
  currentRoute,
  headerProps
}: useHeaderFirstLevelProps) => {
  const navigation = useIONavigation();

  const actionHelp = useHeaderFirstLevelActionPropHelp(currentRoute);
  const actionSettings = useHeaderFirstLevelActionPropSettings();
  const alertProps = useStatusAlertProps(currentRoute);

  const actions = useMemo(
    (): HeaderFirstLevel["actions"] | [] =>
      headerProps.actions
        ? [
            headerProps.actions?.[0],
            headerProps.actions?.[1] ?? actionSettings,
            headerProps.actions?.[2] ?? actionHelp
          ]
        : [],
    [headerProps.actions, actionSettings, actionHelp]
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderFirstLevel
          {...headerProps}
          actions={actions}
          ignoreSafeAreaMargin={!!alertProps}
        />
      )
    });
  }, [navigation, headerProps, alertProps, actions]);
};

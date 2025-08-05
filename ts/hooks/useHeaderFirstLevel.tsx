import { HeaderFirstLevel } from "@pagopa/io-app-design-system";
import { useLayoutEffect, useMemo } from "react";
import { useIONavigation } from "../navigation/params/AppParamsList";
import { MainTabParamsList } from "../navigation/params/MainTabParamsList";
import { useIOAlertVisible } from "../components/StatusMessages/IOAlertVisibleContext";
import { useHeaderFirstLevelActionPropHelp } from "./useHeaderFirstLevelActionPropHelp";
import { useHeaderFirstLevelActionPropSettings } from "./useHeaderFirstLevelActionPropSettings";

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
  actions?: HeaderFirstLevel["actions"];
};

/**
 * This hook sets the `HeaderFirstLevel` in a screen using the `useLayoutEffect` hook.
 */
export const useHeaderFirstLevel = ({
  currentRoute,
  headerProps
}: useHeaderFirstLevelProps) => {
  const navigation = useIONavigation();
  const { actions: incomingActions, ...rest } = headerProps;

  const actionHelp = useHeaderFirstLevelActionPropHelp(currentRoute);
  const actionSettings = useHeaderFirstLevelActionPropSettings();
  const { isAlertVisible } = useIOAlertVisible();
  const actions: HeaderFirstLevel["actions"] = useMemo(() => {
    const fallbackActions: HeaderFirstLevel["actions"] = [
      actionSettings,
      actionHelp
    ];

    /* Undefined means we render fallback actions */
    if (incomingActions === undefined) {
      return fallbackActions;
    }

    /* Empty array means we don't render any actions */
    if (incomingActions.length === 0) {
      return [];
    }

    /* Filter undefined elements */
    const filteredActions = incomingActions.filter(
      action => action !== undefined
    );

    return [
      filteredActions?.[0],
      filteredActions?.[1] ?? actionSettings,
      filteredActions?.[2] ?? actionHelp
    ];
  }, [actionSettings, actionHelp, incomingActions]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderFirstLevel
          {...rest}
          actions={actions}
          ignoreSafeAreaMargin={isAlertVisible}
        />
      )
    });
  }, [navigation, isAlertVisible, rest, actions]);
};

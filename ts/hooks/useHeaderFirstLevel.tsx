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
  const alertProps = useStatusAlertProps(currentRoute);

  /*
    If we don't pass any actions, we render the fallback actions.
    If we explicitly pass an empty array, we don't render any actions.
    */
  const actions: HeaderFirstLevel["actions"] = useMemo(() => {
    const fallbackActions = [actionSettings, actionHelp];

    if (incomingActions === undefined) {
      return fallbackActions as [HeaderActionProps, HeaderActionProps];
    }

    return incomingActions.length > 0
      ? ([
          incomingActions?.[0],
          incomingActions?.[1] ?? actionSettings,
          incomingActions?.[2] ?? actionHelp
        ].filter(action => action !== undefined) as [
          HeaderActionProps,
          HeaderActionProps,
          HeaderActionProps
        ])
      : [];
  }, [actionSettings, actionHelp, incomingActions]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderFirstLevel
          {...rest}
          actions={actions}
          ignoreSafeAreaMargin={!!alertProps}
        />
      )
    });
  }, [navigation, alertProps, rest, actions]);
};

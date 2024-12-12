import * as React from "react";
import { ComponentProps, useLayoutEffect } from "react";
import { HeaderActionProps } from "@pagopa/io-app-design-system";
import HeaderFirstLevel from "../components/ui/HeaderFirstLevel";
import { useIONavigation } from "../navigation/params/AppParamsList";
import { MainTabParamsList } from "../navigation/params/MainTabParamsList";
import { useHeaderFirstLevelActionPropHelp } from "./useHeaderFirstLevelActionPropHelp";
import { useStatusAlertProps } from "./useStatusAlertProps";
import { useHeaderFirstLevelActionPropSettings } from "./useHeaderFirstLevelActionPropSettings";

type useHeaderFirstLevelProps = {
  currentRoute: keyof MainTabParamsList;
  headerProps: HeaderFirstLevelHookProps;
};

/* These props are already managed by the hook,
except for `secondAction`, which has a default behaviour
but can be overridden (as in `ServicesHomeScreen') */
type HeaderFirstLevelHookProps = Omit<
  ComponentProps<typeof HeaderFirstLevel>,
  "firstAction" | "ignoreSafeAreaMargin" | "secondAction"
> & {
  secondAction?: HeaderActionProps;
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

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderFirstLevel
          /* Settings action may be overwritten
          (like in `ServicesHomeScreen`), so we
          put it before the spreading props. */
          secondAction={actionSettings}
          {...headerProps}
          firstAction={actionHelp}
          ignoreSafeAreaMargin={!!alertProps}
        />
      )
    });
  }, [navigation, headerProps, actionHelp, actionSettings, alertProps]);
};

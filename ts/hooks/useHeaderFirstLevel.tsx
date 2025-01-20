import { HeaderActionProps } from "@pagopa/io-app-design-system";
import { useLayoutEffect } from "react";
import HeaderFirstLevel from "../components/ui/HeaderFirstLevel";
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
  "firstAction" | "secondAction" | "ignoreSafeAreaMargin"
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

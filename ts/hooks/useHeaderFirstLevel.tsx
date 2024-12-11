import * as React from "react";
import { ComponentProps, useLayoutEffect } from "react";
import HeaderFirstLevel from "../components/ui/HeaderFirstLevel";
import { useIONavigation } from "../navigation/params/AppParamsList";
import { MainTabParamsList } from "../navigation/params/MainTabParamsList";
import { useStatusAlertProps } from "./useStatusAlertProps";

type useHeaderFirstLevelProps = {
  currentRoute: keyof MainTabParamsList;
  headerProps: ComponentProps<typeof HeaderFirstLevel>;
};

/**
 * This hook sets the `HeaderFirstLevel` in a screen using the `useLayoutEffect` hook.
 */
export const useHeaderFirstLevel = ({
  currentRoute,
  headerProps
}: useHeaderFirstLevelProps) => {
  const navigation = useIONavigation();
  const alertProps = useStatusAlertProps(currentRoute);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderFirstLevel
          {...headerProps}
          ignoreSafeAreaMargin={!!alertProps}
        />
      )
    });
  }, [alertProps, headerProps, navigation]);
};

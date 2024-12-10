import * as React from "react";
import { ComponentProps, useLayoutEffect } from "react";
import { useIONavigation } from "../navigation/params/AppParamsList";
import HeaderFirstLevel from "../components/ui/HeaderFirstLevel";

type HeaderProps = ComponentProps<typeof HeaderFirstLevel>;

/**
 * This hook sets the `HeaderFirstLevel` in a screen using the `useLayoutEffect` hook.
 */
export const useHeaderFirstLevel = (props: HeaderProps) => {
  const navigation = useIONavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <HeaderFirstLevel {...props} />
    });
  }, [navigation, props]);
};

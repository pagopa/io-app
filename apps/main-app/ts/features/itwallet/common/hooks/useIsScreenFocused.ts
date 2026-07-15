import { NavigationContext } from "@react-navigation/native";
import { useContext, useEffect, useState } from "react";

/**
 * Navigation-safe variant of React Navigation's `useIsFocused`.
 *
 * Unlike `useIsFocused`, it does not throw when rendered outside of a
 * navigator (e.g. in unit tests, the design system showcase or isolated
 * playgrounds): in that case it simply reports the screen as focused.
 *
 * @returns `true` when the closest screen is focused (or when there is no
 * navigation context), `false` while it is blurred.
 */
export const useIsScreenFocused = (): boolean => {
  const navigation = useContext(NavigationContext);
  const [isFocused, setIsFocused] = useState<boolean>(
    navigation?.isFocused() ?? true
  );

  useEffect(() => {
    if (!navigation) {
      return undefined;
    }
    // Align the state with the current focus in case it changed between the
    // initial render and the effect running.
    setIsFocused(navigation.isFocused());
    const unsubscribeFocus = navigation.addListener("focus", () =>
      setIsFocused(true)
    );
    const unsubscribeBlur = navigation.addListener("blur", () =>
      setIsFocused(false)
    );
    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation]);

  return isFocused;
};

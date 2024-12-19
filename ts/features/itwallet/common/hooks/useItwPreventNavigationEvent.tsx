import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ItwParamsList } from "../../navigation/ItwParamsList";

/**
 * Hook that prevents the default navigation event when a screen is being removed.
 * It should help avoiding conflicts between React Navigation and xstate.
 *
 * The ITW navigator sends the `back` event every time a screen is removed,
 * so navigation might happen depending on how the machine handles the `back` event.
 * If React Navigation handles navigation in a different way, we let xstate decide by preventing the default event.
 */
export const useItwPreventNavigationEvent = () => {
  const navigation = useNavigation<StackNavigationProp<ItwParamsList>>();

  useEffect(
    () =>
      navigation.addListener("beforeRemove", e => {
        e.preventDefault();
      }),
    [navigation]
  );

  return null;
};

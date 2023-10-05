import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import {
  StackNavigationOptions,
  createStackNavigator
} from "@react-navigation/stack";
import * as React from "react";
import {
  SupportRequestParams,
  useStartSupportRequest
} from "../../hooks/useStartSupportRequest";
import I18n from "../../i18n";

type Stack<T extends Record<string, object | undefined>> = ReturnType<typeof createStackNavigator<T>>;

type Props<T extends Record<string, object | undefined>> = {
  Stack: Stack<T>;
  name: keyof T;
  title: string;
  component: React.ComponentType<any>;
  options?: Omit<StackNavigationOptions, "header" | "headerShown">;
  supportRequestParams?: SupportRequestParams;
};

/**
 * An implementation of a Stack.Screen from a generic "@react-navigation/stack" instance with a default config of HeaderSecondLevel
 */
export const ScreenWithHeader = <T extends Record<string, object | undefined>>({
  Stack,
  name,
  title,
  component,
  options,
  supportRequestParams
}: Props<T>) => {
  const navigation = useNavigation();
  const startSupportRequest = useStartSupportRequest({
    ...supportRequestParams
  });

  return (
    <Stack.Screen
      options={{
        ...options,
        header: () => (
          <HeaderSecondLevel
            type="singleAction"
            goBack={navigation.goBack}
            title={title}
            backAccessibilityLabel={I18n.t("global.buttons.back")}
            firstAction={{
              icon: "help",
              onPress: startSupportRequest,
              accessibilityLabel: I18n.t(
                "global.accessibility.contextualHelp.open.label"
              )
            }}
          />
        )
      }}
      name={name}
      component={component}
    />
  );
};

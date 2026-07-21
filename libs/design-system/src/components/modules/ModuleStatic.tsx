import { ReactNode } from "react";
import { PressableProps, View, ViewProps } from "react-native";

import { useIOTheme } from "../../context";
import { IOColors, IOModuleStyles } from "../../core";
import { HStack } from "../layout";

type ModuleStaticMultipleBlockProps = {
  children?: never;
  disabled?: PressableProps["disabled"];
  endBlock?: ReactNode;
  startBlock: ReactNode;
};

type ModuleStaticProps = (
  | ModuleStaticMultipleBlockProps
  | ModuleStaticSingleBlockProps
) &
  Pick<ViewProps, "accessibilityLabel" | "accessibilityState" | "accessible">;

type ModuleStaticSingleBlockProps = {
  children: ReactNode;
  disabled?: PressableProps["disabled"];
  endBlock?: never;
  startBlock?: never;
};

const DISABLED_OPACITY = 0.5;

export const ModuleStatic = ({
  disabled = false,
  startBlock,
  endBlock,
  children,
  accessible = false,
  accessibilityLabel,
  accessibilityState
}: ModuleStaticProps) => {
  const theme = useIOTheme();

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      accessible={accessible}
      style={[
        IOModuleStyles.button,
        {
          borderColor: IOColors[theme["cardBorder-default"]],
          opacity: disabled ? DISABLED_OPACITY : 1
        }
      ]}
    >
      {startBlock && (
        <HStack space={8} style={{ alignItems: "center" }}>
          <View
            style={{ flexDirection: "row", alignItems: "center", flexGrow: 1 }}
          >
            {startBlock}
          </View>
          {endBlock}
        </HStack>
      )}

      {children}
    </View>
  );
};

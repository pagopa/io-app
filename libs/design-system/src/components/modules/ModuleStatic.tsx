import { ReactNode } from "react";
import { PressableProps, View, ViewProps } from "react-native";
import { useIOTheme } from "../../context";
import { IOColors, IOModuleStyles } from "../../core";
import { HStack } from "../layout";

type ModuleStaticProps = Pick<
  ViewProps,
  "accessible" | "accessibilityLabel" | "accessibilityState"
> &
  (ModuleStaticSingleBlockProps | ModuleStaticMultipleBlockProps);

type ModuleStaticMultipleBlockProps = {
  startBlock: ReactNode;
  endBlock?: ReactNode;
  children?: never;
  disabled?: PressableProps["disabled"];
};

type ModuleStaticSingleBlockProps = {
  startBlock?: never;
  endBlock?: never;
  children: ReactNode;
  disabled?: PressableProps["disabled"];
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
      style={[
        IOModuleStyles.button,
        {
          borderColor: IOColors[theme["cardBorder-default"]],
          opacity: disabled ? DISABLED_OPACITY : 1
        }
      ]}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
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

import { ReactNode } from "react";
import { PressableProps, View, ViewProps } from "react-native";

import { useIOTheme } from "../../context";
import {
  IOColorsLegacy,
  IODimensions,
  IOModuleStyles,
  IOOpacity
} from "../../core";
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
          borderColor: IOColorsLegacy[theme["cardBorder-default"]],
          opacity: disabled ? IOOpacity.disabled : 1
        }
      ]}
    >
      {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions -- ReactNode: "" and false mean nothing to render */}
      {startBlock && (
        <HStack
          space={IODimensions.gap.module.trailing}
          style={{ alignItems: "center" }}
        >
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

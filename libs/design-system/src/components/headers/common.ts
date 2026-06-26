import { ComponentProps } from "react";
import { IconButton } from "../buttons";

export type HeaderActionProps = Pick<
  ComponentProps<typeof IconButton>,
  "icon" | "onPress" | "accessibilityLabel" | "accessibilityHint" | "testID"
>;

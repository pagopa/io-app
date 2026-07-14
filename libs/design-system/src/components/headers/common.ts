import { ComponentProps } from "react";

import { IconButton } from "../buttons";

export type HeaderActionProps = Pick<
  ComponentProps<typeof IconButton>,
  "accessibilityHint" | "accessibilityLabel" | "icon" | "onPress" | "testID"
>;

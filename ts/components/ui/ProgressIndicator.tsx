import { ProgressLoader, useIOTheme } from "@pagopa/io-app-design-system";
import { ComponentProps } from "react";

export type ProgressIndicator = Exclude<
  ComponentProps<typeof ProgressLoader>,
  "color"
>;

export const ProgressIndicator = (props: ProgressIndicator) => {
  const theme = useIOTheme();
  const blueColor = theme["interactiveElem-default"];

  return <ProgressLoader progress={props.progress} color={blueColor} />;
};

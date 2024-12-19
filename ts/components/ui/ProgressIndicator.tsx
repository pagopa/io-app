import { ProgressLoader } from "@pagopa/io-app-design-system";
import { ComponentProps } from "react";
import { useInteractiveElementDefaultColor } from "../../utils/hooks/theme";

export type ProgressIndicator = Exclude<
  ComponentProps<typeof ProgressLoader>,
  "color"
>;

export const ProgressIndicator = (props: ProgressIndicator) => {
  const blueColor = useInteractiveElementDefaultColor();

  return <ProgressLoader progress={props.progress} color={blueColor} />;
};

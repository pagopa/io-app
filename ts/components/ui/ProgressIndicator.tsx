import * as React from "react";
import { ProgressLoader } from "@pagopa/io-app-design-system";
import { useInteractiveElementDefaultColor } from "../../utils/hooks/theme";

export type ProgressIndicator = Exclude<
  React.ComponentProps<typeof ProgressLoader>,
  "color"
>;

export const ProgressIndicator = (props: ProgressIndicator) => {
  const blueColor = useInteractiveElementDefaultColor();

  return <ProgressLoader progress={props.progress} color={blueColor} />;
};

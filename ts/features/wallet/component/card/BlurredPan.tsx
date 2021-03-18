import * as React from "react";
import { Monospace } from "../../../../components/core/typography/Monospace";

/**
 * Represent a blurred pan using a consistent style within different components
 * @param props
 * @constructor
 */

type OwnProps = Omit<
  React.ComponentProps<typeof Monospace>,
  "color" | "weight"
>;

export const BlurredPan: React.FunctionComponent<OwnProps> = props => (
  <Monospace color={"bluegreyDark"} {...props}>
    {props.children}
  </Monospace>
);

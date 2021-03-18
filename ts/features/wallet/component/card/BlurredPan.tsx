import * as React from "react";
import { Monospace } from "../../../../components/core/typography/Monospace";

/**
 * Represent a blurred pan using a consistent style within different components
 * @param props
 * @constructor
 */
export const BlurredPan: React.FunctionComponent = props => (
  <Monospace color={"bluegreyDark"}>{props.children}</Monospace>
);

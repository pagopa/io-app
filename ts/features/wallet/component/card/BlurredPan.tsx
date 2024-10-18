import { BodyMonospace } from "@pagopa/io-app-design-system";
import * as React from "react";
import { ComponentProps } from "react";

/**
 * Represent a blurred pan using a consistent style within different components
 * @param props
 * @constructor
 */

type OwnProps = Omit<ComponentProps<typeof BodyMonospace>, "color" | "weight">;

export const BlurredPan: React.FunctionComponent<OwnProps> = props => (
  <BodyMonospace color={"bluegreyDark"} {...props}>
    {props.children}
  </BodyMonospace>
);

import * as React from "react";
import Placeholder, { BoxProps } from "rn-placeholder";

export const Skeleton = (props: BoxProps) => (
  <Placeholder.Box {...props} animate="fade" radius={4} />
);

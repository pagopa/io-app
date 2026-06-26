export type DisplayInsets = Record<Placement, number>;
export type Placement = "top" | "bottom" | "left" | "right";
export type ChildrenCoords = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export type TooltipLayout = ChildrenCoords;

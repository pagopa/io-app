export type ChildrenCoords = {
  height: number;
  width: number;
  x: number;
  y: number;
};
export type DisplayInsets = Record<Placement, number>;
export type Placement = "bottom" | "left" | "right" | "top";
export type TooltipLayout = ChildrenCoords;

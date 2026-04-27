export type ItwProximityFailure = {
  reason: unknown;
  origin?: string;
  type: string;
};

export type ItwProximityGenericFailure = ItwProximityFailure & {
  proximity_sharing_status: "pre" | "post";
};

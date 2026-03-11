export type ItwProximityFailure = {
  reason: unknown;
  type: string;
};

export type ItwProximityGenericFailure = ItwProximityFailure & {
  proximity_sharing_status: "pre" | "post";
};

import { TimelineDTO as GeneratedTimelineDTO } from "@io-app/api-types/generated/definitions/idpay/TimelineDTO";
import * as t from "io-ts";

// The API spec incorrectly limits the total across all pages to 10 operations.
export const TimelineDTO = t.intersection(
  [
    t.type({
      ...GeneratedTimelineDTO.types[0].props,
      totalElements: t.refinement(
        t.Integer,
        value => value >= 0,
        "NonNegativeInteger"
      )
    }),
    GeneratedTimelineDTO.types[1]
  ],
  "TimelineDTO"
);

export type TimelineDTO = t.TypeOf<typeof TimelineDTO>;

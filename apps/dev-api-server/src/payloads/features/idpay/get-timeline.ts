import { fakerIT as faker } from "@faker-js/faker";
import { TimelineDTO } from "@io-app/api-types/generated/definitions/idpay/TimelineDTO";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import _ from "lodash";

import { initiativeTimeline } from "../../../persistence/idpay";

export const getTimelineResponse = (
  initiativeId: string,
  pageNo = 1,
  pageSize = 3
): O.Option<TimelineDTO> =>
  pipe(
    initiativeTimeline[initiativeId],
    O.fromNullable,
    O.map(timeline => {
      const totalElements = timeline.length;
      const totalPages = Math.ceil(totalElements / pageSize);

      // It should start from 0, but pageNo is 1-based, so we need to subtract 1 but backend change it on prod
      const startIndex = pageNo * pageSize;
      const endIndex = startIndex + pageSize;
      const operationList = _.slice(timeline, startIndex, endIndex);

      return {
        lastUpdate: faker.date.recent({ days: 0.05 }),
        operationList,
        pageNo,
        pageSize,
        totalElements,
        totalPages
      } as TimelineDTO;
    })
  );

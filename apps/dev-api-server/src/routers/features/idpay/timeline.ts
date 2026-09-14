import { sequenceT } from "fp-ts/lib/Apply";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { getIdPayError } from "../../../payloads/features/idpay/error";
import { getTimelineResponse } from "../../../payloads/features/idpay/get-timeline";
import { getTimelineDetailResponse } from "../../../payloads/features/idpay/get-timeline-detail";
import { getWalletDetailResponse } from "../../../payloads/features/idpay/get-wallet-detail";
import { addIdPayHandler } from "./router";

type Query =
  | Array<qs.ParsedQs>
  | Array<string>
  | qs.ParsedQs
  | string
  | undefined;

const extractQuery = (query: Query) =>
  pipe(
    query,
    O.fromNullable,
    O.map(s => parseInt(s as string, 10)),
    O.toUndefined
  );

/**
 *  Returns the list of transactions and operations of an initiative of a
 *  citizen sorted by date (newest->oldest)
 */
addIdPayHandler("get", "/timeline/:initiativeId", (req, res) =>
  pipe(
    req.params.initiativeId,
    O.fromNullable,
    O.chain(getWalletDetailResponse),
    O.chain(({ initiativeId }) =>
      pipe(
        sequenceT(O.Monad)(
          O.of(initiativeId),
          O.of(pipe(req.query.page as Query, extractQuery)),
          O.of(pipe(req.query.size as Query, extractQuery))
        ),
        O.chain(args => getTimelineResponse(...args))
      )
    ),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      timeline => res.status(200).json(timeline)
    )
  )
);

/**
 * Returns the detail of a transaction
 */
addIdPayHandler("get", "/timeline/:initiativeId/:operationId", (req, res) =>
  pipe(
    sequenceT(O.Monad)(
      pipe(
        req.params.initiativeId,
        O.fromNullable,
        O.chain(getWalletDetailResponse),
        O.map(({ initiativeId }) => initiativeId)
      ),
      pipe(req.params.operationId, O.fromNullable)
    ),
    O.chain(args => getTimelineDetailResponse(...args)),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      operation => res.status(200).json(operation)
    )
  )
);

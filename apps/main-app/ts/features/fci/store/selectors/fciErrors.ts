import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";

import {
  fciLoadQtspClauses,
  fciLoadQtspFilledDocument,
  fciPollFilledDocument
} from "../actions";
import { fciPollFilledDocumentSelector } from "../reducers/fciPollFilledDocument";
import { fciQtspClausesMetadataSelector } from "../reducers/fciQtspClauses";
import { fciQtspFilledDocumentSelector } from "../reducers/fciQtspFilledDocument";

const FCI_QTSP_ERROR_KIND = {
  qtspClauses: getType(fciLoadQtspClauses.failure),
  filledDocument: getType(fciLoadQtspFilledDocument.failure),
  pollFilledDocument: getType(fciPollFilledDocument.failure)
} as const;

export type FciQtspErrorKind =
  (typeof FCI_QTSP_ERROR_KIND)[keyof typeof FCI_QTSP_ERROR_KIND];

/**
 * Returns which of the three qtsp preparation steps failed if any.
 */
export const fciQtspErrorKindSelector = createSelector(
  fciQtspClausesMetadataSelector,
  fciQtspFilledDocumentSelector,
  fciPollFilledDocumentSelector,
  (clauses, filledDocument, poll): FciQtspErrorKind | undefined => {
    if (pot.isError(clauses)) {
      return FCI_QTSP_ERROR_KIND.qtspClauses;
    }
    if (pot.isError(filledDocument)) {
      return FCI_QTSP_ERROR_KIND.filledDocument;
    }
    if (pot.isError(poll)) {
      return FCI_QTSP_ERROR_KIND.pollFilledDocument;
    }
    return undefined;
  }
);

export const fciHasQtspErrorSelector = createSelector(
  fciQtspErrorKindSelector,
  errorKind => errorKind !== undefined
);

import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";

import { fciPollFilledDocumentSelector } from "../reducers/fciPollFilledDocument";
import { fciQtspClausesMetadataSelector } from "../reducers/fciQtspClauses";
import { fciQtspFilledDocumentSelector } from "../reducers/fciQtspFilledDocument";

/**
 * Returns true when any of the three document-preparation steps has entered
 * an error state (QTSP clauses, filled document creation, or polling).
 */
export const fciHasDocumentPreparationErrorSelector = createSelector(
  fciQtspClausesMetadataSelector,
  fciQtspFilledDocumentSelector,
  fciPollFilledDocumentSelector,
  (clauses, filledDocument, poll) =>
    pot.isError(clauses) || pot.isError(filledDocument) || pot.isError(poll)
);

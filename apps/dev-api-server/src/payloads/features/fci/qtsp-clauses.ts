import { QtspClause } from "@io-app/api-types/generated/definitions/fci/QtspClause";
import { QtspClausesMetadataDetailView } from "@io-app/api-types/generated/definitions/fci/QtspClausesMetadataDetailView";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";

import { templateUrl } from "./qtsp-filled-document";

export const qtspClauses: QtspClausesMetadataDetailView = {
  clauses: [
    {
      text: "Dichiaro quanto indicato nel [Quadro E - Autocertificazione e sottoscrizione da parte del titolare](@DOCUMENT_URL)"
    } as QtspClause,
    {
      text: "Accetto le Condizioni Generali di [Contratto](http://127.0.0.1:3000/static_contents/fci/template) (Mod.NAM CA01) e le clausole vessatorie riportate nel [Quadro F – Clausole vessatorie](@DOCUMENT_URL)"
    } as QtspClause
  ],
  document_url: templateUrl,
  nonce: "nonceMockedBase64" as NonEmptyString,
  privacy_url: templateUrl,
  privacy_text:
    "Confermo di aver letto l’[informativa sul trattamento dei dati personali](@PRIVACY_URL)" as NonEmptyString,
  terms_and_conditions_url: templateUrl
};

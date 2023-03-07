import { EmailString, NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { TypeEnum as ClausesTypeEnum } from "../../../../../definitions/fci/Clause";
import { DocumentDetailView } from "../../../../../definitions/fci/DocumentDetailView";
import { SignatureField } from "../../../../../definitions/fci/SignatureField";
import {
  SignatureRequestDetailView,
  StatusEnum as SignatureRequestStatus
} from "../../../../../definitions/fci/SignatureRequestDetailView";

const now = new Date();

export const mockDocuments: ReadonlyArray<DocumentDetailView> = [
  {
    id: "1" as NonEmptyString,
    created_at: new Date(),
    url: `http://127.0.0.1:3000/static_content/fci/modulo_1` as NonEmptyString,
    updated_at: new Date(),
    metadata: {
      title: "Modulo 1" as NonEmptyString,
      signature_fields: [
        {
          clause: {
            title: "clause title 1" as NonEmptyString,
            type: ClausesTypeEnum.REQUIRED
          },
          attrs: {
            unique_name: "unique_name_1" as NonEmptyString
          }
        },
        {
          clause: {
            title: "clause title 2" as NonEmptyString,
            type: ClausesTypeEnum.OPTIONAL
          },
          attrs: {
            unique_name: "unique_name_2" as NonEmptyString
          }
        },
        {
          clause: {
            title: "clause title 3",
            type: ClausesTypeEnum.UNFAIR
          },
          attrs: {
            unique_name: "unique_name_3" as NonEmptyString
          }
        }
      ] as ReadonlyArray<SignatureField>
    }
  }
];

export const mockSignatureRequestDetailView: SignatureRequestDetailView = {
  id: "mockId" as NonEmptyString,
  status: SignatureRequestStatus.WAIT_FOR_SIGNATURE,
  issuer: {
    email: "fake-email@issuer.nomail" as EmailString,
    description: "Description of the issuer" as NonEmptyString
  },
  expires_at: new Date(now.setDate(now.getDate() + 30)),
  created_at: now,
  dossier_id: "mockDossierId" as NonEmptyString,
  qr_code_url: "mockQrCodeUrl",
  signer_id: "mockSignerId" as NonEmptyString,
  updated_at: now,
  documents: mockDocuments
};

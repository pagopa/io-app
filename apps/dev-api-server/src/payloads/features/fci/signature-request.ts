import { TypeEnum as ClausesTypeEnum } from "@io-app/api-types/generated/definitions/fci/Clause";
import { DocumentDetailView } from "@io-app/api-types/generated/definitions/fci/DocumentDetailView";
import { DocumentMetadata } from "@io-app/api-types/generated/definitions/fci/DocumentMetadata";
import { DossierTitle } from "@io-app/api-types/generated/definitions/fci/DossierTitle";
import { IssuerEnvironmentEnum } from "@io-app/api-types/generated/definitions/fci/IssuerEnvironment";
import { SignatureFieldToBeCreatedAttrs } from "@io-app/api-types/generated/definitions/fci/SignatureFieldToBeCreatedAttrs";
import { SignatureRequestDetailView } from "@io-app/api-types/generated/definitions/fci/SignatureRequestDetailView";
import { SignatureRequestStatusEnum } from "@io-app/api-types/generated/definitions/fci/SignatureRequestStatus";
import { EmailString, NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { ulid } from "ulid";

import { staticContentRootPath } from "../../../config";
import { serverUrl } from "../../../utils/server";

export const SIGNATURE_REQUEST_ID = ulid() as NonEmptyString;
export const EXPIRED_SIGNATURE_REQUEST_ID = ulid() as NonEmptyString;
export const WAIT_QTSP_SIGNATURE_REQUEST_ID = ulid() as NonEmptyString;
export const SIGNED_SIGNATURE_REQUEST_ID = ulid() as NonEmptyString;
export const SIGNED_EXPIRED_SIGNATURE_REQUEST_ID = ulid() as NonEmptyString;
export const REJECTED_SIGNATURE_REQUEST_ID = ulid() as NonEmptyString;
export const NO_FIELDS_SIGNATURE_REQUEST_ID = ulid() as NonEmptyString;
export const CANCELED_SIGNATURE_REQUEST_ID = ulid() as NonEmptyString;
const DOSSIER_ID = ulid() as NonEmptyString;
const SIGNATURE_ID = ulid() as NonEmptyString;

const now = new Date();
const mockQrCodeUrl =
  "https://gist.githubusercontent.com/lucacavallaro/a3b9d5305cc6e2c9bdfb6ec1dc28fd96/raw/26799f357ff712396cdbc4f862a13099758e89d3/qr-code.png" as NonEmptyString;
const basePath = serverUrl;
export const documents: ReadonlyArray<DocumentDetailView> = [
  {
    id: ulid() as NonEmptyString,
    created_at: new Date(),
    url: `${basePath}${staticContentRootPath}/fci/modulo_1` as NonEmptyString,
    updated_at: new Date(),
    metadata: {
      title: "DEMO POC #1",
      signature_fields: [
        {
          attrs: {
            unique_name: "Signature1" as NonEmptyString
          },
          clause: {
            title:
              "CLAUSOLA 1 DOC 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas porta tortor a mattis eleifend." as NonEmptyString,
            type: ClausesTypeEnum.REQUIRED
          }
        },
        {
          attrs: {
            unique_name: "Signature2" as NonEmptyString
          },
          clause: {
            title:
              "CLAUSOLA 2 DOC 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas porta tortor a mattis eleifend." as NonEmptyString,
            type: ClausesTypeEnum.UNFAIR
          }
        },
        {
          attrs: {
            unique_name: "Signature3" as NonEmptyString
          },
          clause: {
            title:
              "CLAUSOLA 3 DOC 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas porta tortor a mattis eleifend." as NonEmptyString,
            type: ClausesTypeEnum.OPTIONAL
          }
        },
        {
          attrs: {
            unique_name: "Signature4" as NonEmptyString
          },
          clause: {
            title:
              "CLAUSOLA 4 DOC 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas porta tortor a mattis eleifend." as NonEmptyString,
            type: ClausesTypeEnum.OPTIONAL
          }
        }
      ]
    } as DocumentMetadata
  },
  {
    id: ulid() as NonEmptyString,
    created_at: new Date(),
    url: `${basePath}${staticContentRootPath}/fci/modulo_2` as NonEmptyString,
    updated_at: new Date(),
    metadata: {
      title: "DEMO POC #2",
      signature_fields: [
        {
          attrs: {
            unique_name: "Signature1" as NonEmptyString
          },
          clause: {
            title:
              "CLAUSOLA 1 DOC 2: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas porta tortor a mattis eleifend." as NonEmptyString,
            type: ClausesTypeEnum.REQUIRED
          }
        },
        {
          attrs: {
            unique_name: "Signature2" as NonEmptyString
          },
          clause: {
            title: "CLAUSOLA 2 DOC 2" as NonEmptyString,
            type: ClausesTypeEnum.UNFAIR
          }
        },
        {
          attrs: {
            unique_name: "Signature3" as NonEmptyString
          },
          clause: {
            title:
              "CLAUSOLA 3 DOC 2: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas porta tortor a mattis eleifend." as NonEmptyString,
            type: ClausesTypeEnum.OPTIONAL
          }
        }
      ]
    } as DocumentMetadata
  },
  {
    id: ulid() as NonEmptyString,
    created_at: new Date(),
    url: `${basePath}${staticContentRootPath}/fci/modulo_3` as NonEmptyString,
    updated_at: new Date(),
    metadata: {
      title: "DEMO POC #3",
      signature_fields: [
        {
          attrs: {
            bottom_left: { x: 85, y: 700 },
            top_right: { x: 35, y: 550 },
            page: 0
          } as SignatureFieldToBeCreatedAttrs,
          clause: {
            title: "CLAUSOLA 1 DOC 3" as NonEmptyString,
            type: ClausesTypeEnum.REQUIRED
          }
        },
        {
          attrs: {
            bottom_left: { x: 350, y: 700 },
            top_right: { x: 300, y: 550 },
            page: 0
          } as SignatureFieldToBeCreatedAttrs,
          clause: {
            title: "CLAUSOLA 2 DOC 3" as NonEmptyString,
            type: ClausesTypeEnum.REQUIRED
          }
        },
        {
          attrs: {
            bottom_left: { x: 85, y: 520 },
            top_right: { x: 35, y: 370 },
            page: 0
          } as SignatureFieldToBeCreatedAttrs,
          clause: {
            title: "CLAUSOLA 3 DOC 3" as NonEmptyString,
            type: ClausesTypeEnum.OPTIONAL
          }
        },
        {
          attrs: {
            bottom_left: { x: 85, y: 680 },
            top_right: { x: 35, y: 530 },
            page: 0
          } as SignatureFieldToBeCreatedAttrs,
          clause: {
            title:
              "CLAUSOLA 4 DOC 3: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas porta tortor a mattis eleifend." as NonEmptyString,
            type: ClausesTypeEnum.UNFAIR
          }
        },
        {
          attrs: {
            bottom_left: { x: 85, y: 470 },
            top_right: { x: 35, y: 320 },
            page: 0
          } as SignatureFieldToBeCreatedAttrs,
          clause: {
            title:
              "CLAUSOLA 5 DOC 3: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas porta tortor a mattis eleifend." as NonEmptyString,
            type: ClausesTypeEnum.OPTIONAL
          }
        },
        {
          attrs: {
            bottom_left: { x: 85, y: 360 },
            top_right: { x: 35, y: 210 },
            page: 0
          } as SignatureFieldToBeCreatedAttrs,
          clause: {
            title: "CLAUSOLA 6 DOC 3" as NonEmptyString,
            type: ClausesTypeEnum.UNFAIR
          }
        }
      ]
    } as DocumentMetadata
  },
  {
    id: ulid() as NonEmptyString,
    created_at: new Date(),
    url: `${basePath}${staticContentRootPath}/fci/modulo_4` as NonEmptyString,
    updated_at: new Date(),
    metadata: {
      title: "DEMO POC #4",
      signature_fields: [
        {
          attrs: {
            unique_name: "Signature1" as NonEmptyString
          },
          clause: {
            title: "CLAUSOLA 1 DOC 1" as NonEmptyString,
            type: ClausesTypeEnum.REQUIRED
          }
        },
        {
          attrs: {
            unique_name: "Signature2" as NonEmptyString
          },
          clause: {
            title: "CLAUSOLA 2 DOC 1" as NonEmptyString,
            type: ClausesTypeEnum.OPTIONAL
          }
        }
      ]
    } as DocumentMetadata
  },
  {
    id: ulid() as NonEmptyString,
    created_at: new Date(),
    url: `${basePath}${staticContentRootPath}/fci/modulo_5` as NonEmptyString,
    updated_at: new Date(),
    metadata: {
      title: "DEMO POC #5",
      signature_fields: [
        {
          attrs: {
            unique_name: "Signature1" as NonEmptyString
          },
          clause: {
            title: "CLAUSOLA 1 DOC 5" as NonEmptyString,
            type: ClausesTypeEnum.REQUIRED
          }
        },
        {
          attrs: {
            unique_name: "Signature2" as NonEmptyString
          },
          clause: {
            title: "CLAUSOLA 2 DOC 5" as NonEmptyString,
            type: ClausesTypeEnum.OPTIONAL
          }
        },
        {
          attrs: {
            unique_name: "Signature3" as NonEmptyString
          },
          clause: {
            title: "CLAUSOLA 3 DOC 5" as NonEmptyString,
            type: ClausesTypeEnum.REQUIRED
          }
        },
        {
          attrs: {
            unique_name: "Signature4" as NonEmptyString
          },
          clause: {
            title: "CLAUSOLA 4 DOC 5" as NonEmptyString,
            type: ClausesTypeEnum.REQUIRED
          }
        },
        {
          attrs: {
            unique_name: "Signature5" as NonEmptyString
          },
          clause: {
            title: "CLAUSOLA 5 DOC 5" as NonEmptyString,
            type: ClausesTypeEnum.OPTIONAL
          }
        },
        {
          attrs: {
            unique_name: "Signature6" as NonEmptyString
          },
          clause: {
            title: "CLAUSOLA 6 DOC 5" as NonEmptyString,
            type: ClausesTypeEnum.REQUIRED
          }
        }
      ]
    } as DocumentMetadata
  }
];

export const signatureRequestDetailViewDoc: SignatureRequestDetailView = {
  id: SIGNATURE_REQUEST_ID,
  status: SignatureRequestStatusEnum.WAIT_FOR_SIGNATURE,
  issuer: {
    email: "fake-email@issuer.nomail" as EmailString,
    description: "Description of the issuer" as NonEmptyString,
    environment: IssuerEnvironmentEnum.TEST
  },
  created_at: new Date(),
  dossier_id: DOSSIER_ID,
  dossier_title: "Dossier title" as DossierTitle,
  expires_at: new Date(now.setDate(now.getDate() + 30)),
  qr_code_url: mockQrCodeUrl,
  signer_id: SIGNATURE_ID,
  updated_at: new Date(),
  documents: documents.slice(0, 2)
};

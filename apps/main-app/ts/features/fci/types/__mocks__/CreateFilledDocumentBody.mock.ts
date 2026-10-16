import { CreateFilledDocument } from "@io-app/api-types/generated/definitions/fci/CreateFilledDocument";
import { FilledDocumentDetailView } from "@io-app/api-types/generated/definitions/fci/FilledDocumentDetailView";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";

export const createFilledDocumentBody: CreateFilledDocument = {
  document_url:
    "https://pagopa.demo.bit4id.org/static/docs/modulo_richiesta_V1.pdf" as NonEmptyString
};

export const qtspFilledDocument: FilledDocumentDetailView = {
  filled_document_url:
    "https://pagopa.demo.bit4id.org/static/docs/modulo_richiesta_V1.pdf"
};

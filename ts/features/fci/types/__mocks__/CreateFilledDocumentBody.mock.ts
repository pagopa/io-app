import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { CreateFilledDocument } from "../../../../../definitions/fci/CreateFilledDocument";
import { FilledDocumentDetailView } from "../../../../../definitions/fci/FilledDocumentDetailView";

export const createFilledDocumentBody: CreateFilledDocument = {
  document_url:
    "https://pagopa.demo.bit4id.org/static/docs/modulo_richiesta_V1.pdf" as NonEmptyString
};

export const qtspFilledDocument: FilledDocumentDetailView = {
  filled_document_url:
    "https://pagopa.demo.bit4id.org/static/docs/modulo_richiesta_V1.pdf"
};

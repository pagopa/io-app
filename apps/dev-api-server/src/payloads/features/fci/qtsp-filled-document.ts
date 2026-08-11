import { CreateFilledDocument } from "@io-app/api-types/generated/definitions/fci/CreateFilledDocument";
import { FilledDocumentDetailView } from "@io-app/api-types/generated/definitions/fci/FilledDocumentDetailView";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";

export const templateUrl = "http://127.0.0.1:3000/static_contents/fci/template";

export const createFilledDocumentBody: CreateFilledDocument = {
  document_url: templateUrl as NonEmptyString
};

export const qtspFilledDocument: FilledDocumentDetailView = {
  filled_document_url: templateUrl
};

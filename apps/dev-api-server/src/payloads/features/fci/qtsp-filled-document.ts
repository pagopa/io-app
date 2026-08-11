import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";

import { CreateFilledDocument } from "../../../../generated/definitions/fci/CreateFilledDocument";
import { FilledDocumentDetailView } from "../../../../generated/definitions/fci/FilledDocumentDetailView";

export const templateUrl = "http://127.0.0.1:3000/static_contents/fci/template";

export const createFilledDocumentBody: CreateFilledDocument = {
  document_url: templateUrl as NonEmptyString
};

export const qtspFilledDocument: FilledDocumentDetailView = {
  filled_document_url: templateUrl
};

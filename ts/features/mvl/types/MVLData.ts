import { IUnitTag } from "@pagopa/ts-commons/lib/units";
import { ValidUrl } from "@pagopa/ts-commons/lib/url";
import { ContentType } from "../../../types/contentType";
import { Byte } from "../../../types/digitalInformationUnit";

/**
 * The unique ID of a MVLId, used to avoid to pass wrong id as parameters
 */
export type MVLId = string & IUnitTag<"MVLId">;

export type WithMVLId<T> = T & {
  id: MVLId;
};

/**
 * The content of the MVL with two possible representation
 */
type MVLBody = {
  html: string;
  plain?: string;
};

/**
 * Represent an attachment with the metadata and resourceUrl to retrieve the attachment
 */
type MVLAttachment = {
  // a display name for the file
  name: string;
  // atm we have to distinguish only the pdf files from the others for a custom (future) view
  contentType: Extract<ContentType, "application/pdf"> | "undefined";
  // size (in Byte) of the attachment, for display purpose
  size: Byte;
  // The url that can be used to retrieve the resource
  resourceUrl: ValidUrl;
};

/**
 * Additional metadata
 * TODO: Just an initial stub, should be completed and refined
 */
type MVLMetadata = {
  sender: string;
  receiver: string;
  cc: ReadonlyArray<string>;
  // a placeholder for certificates data
  certificates: ReadonlyArray<unknown>;
  // a placeholder for signature details
  signature: unknown;
};

/**
 * Represent a MVL (Messaggio a valore legale - Legal message)
 */
export type MVLData = WithMVLId<{
  // The body (content) that could be html (mandatory) or plain (optional)
  body: MVLBody;
  // The MVL could have some attachments with metadata and the url to download the resource
  attachments: ReadonlyArray<MVLAttachment>;
  // Some additional metadata that should be represented
  metadata: MVLMetadata;
}>;

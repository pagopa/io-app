import { IUnitTag } from "@pagopa/ts-commons/lib/units";
import { ValidUrl } from "@pagopa/ts-commons/lib/url";
import { EmailAddress } from "../../../../definitions/backend/EmailAddress";
import { UIMessage } from "../../../store/reducers/entities/messages/types";
import { ContentType } from "../../../types/contentType";
import { Byte } from "../../../types/digitalInformationUnit";

/**
 * The unique ID of a MVLId, used to avoid to pass wrong id as parameters
 */
export type MvlId = string & IUnitTag<"MvlId">;

export type WithMVLId<T> = T & {
  id: MvlId;
};

/**
 * The content of the MVL with two possible representation
 */
export type MvlBody = {
  html: string;
  plain?: string;
};

/**
 * Represent an attachment with the metadata and resourceUrl to retrieve the attachment
 */
export type MvlAttachment = {
  // a display name for the file
  name: string;
  // atm we have to distinguish only the pdf files from the others for a custom (future) view
  contentType: Extract<ContentType, "application/pdf"> | "other";
  // size (in Byte) of the attachment, for display purpose
  size: Byte;
  // The url that can be used to retrieve the resource
  resourceUrl: ValidUrl;
};

/**
 * Additional metadata
 * TODO: Just an initial stub, should be completed and refined
 */
export type MvlMetadata = {
  sender: EmailAddress;
  receiver: EmailAddress;
  cc: ReadonlyArray<EmailAddress>;
  // a placeholder for certificates data
  certificates: ReadonlyArray<unknown>;
  // a placeholder for signature details
  signature: unknown;
};

/**
 * Represent a MVL (Messaggio a valore legale - Legal message)
 */
export type MvlData = {
  // The body (content) that could be html (mandatory) or plain (optional)
  body: MvlBody;
  // The MVL could have some attachments with metadata and the url to download the resource
  attachments: ReadonlyArray<MvlAttachment>;
  // Some additional metadata that should be represented
  metadata: MvlMetadata;
};

/**
 * A legal message composed by:
 * - A classic message data
 * - The additional legal message data
 */
export type Mvl = WithMVLId<{
  message: UIMessage;
  legalMessage: MvlData;
}>;

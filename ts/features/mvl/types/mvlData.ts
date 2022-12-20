import { IUnitTag } from "@pagopa/ts-commons/lib/units";
import { EmailAddress } from "../../../../definitions/backend/EmailAddress";
import {
  UIMessageDetails,
  WithUIMessageId,
  UIAttachment
} from "../../../store/reducers/entities/messages/types";

/**
 * The content of the MVL with two possible representation
 */
export type MvlBody = {
  html: string;
  plain: string;
};

export type MvlId = string & IUnitTag<"MvlId">;

/**
 * Additional metadata
 * TODO: Just an initial stub, should be completed and refined
 */
export type MvlMetadata = {
  id: MvlId;
  subject: string;
  timestamp: Date;
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
  attachments: ReadonlyArray<UIAttachment>;
  // Some additional metadata that should be represented
  metadata: MvlMetadata;
};

/**
 * A legal message composed by:
 * - A classic message data
 * - The additional legal message data
 */
export type Mvl = WithUIMessageId<{
  message: UIMessageDetails;
  legalMessage: MvlData;
}>;

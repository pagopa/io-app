import * as pot from "@pagopa/ts-commons/lib/pot";

import { UIMessage } from "../../../types";
import { MessageListCategory } from "../../../types/messageListCategory";

/**
 * A list of messages and pagination inbox.
 */
export type AllPaginated = {
  archive: Collection;
  inbox: Collection;
  shownCategory: MessageListCategory;
};

export type Collection = {
  data: MessagePagePot;
  /** persist the last action type occurred */
  lastRequest?: LastRequestValues;
  lastUpdateTime: Date;
};

export type LastRequestValues = "all" | "next" | "previous";

export type MessageError = {
  reason: string;
  time: Date;
};

export type MessagePage = {
  next?: string;
  page: ReadonlyArray<UIMessage>;
  previous?: string;
};

export type MessagePagePot = pot.Pot<MessagePage, MessageError>;

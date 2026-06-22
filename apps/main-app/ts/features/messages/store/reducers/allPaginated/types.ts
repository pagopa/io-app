import * as pot from "@pagopa/ts-commons/lib/pot";
import { MessageListCategory } from "../../../types/messageListCategory";
import { UIMessage } from "../../../types";

export type MessagePage = {
  page: ReadonlyArray<UIMessage>;
  previous?: string;
  next?: string;
};

export type MessageError = {
  reason: string;
  time: Date;
};

export type MessagePagePot = pot.Pot<MessagePage, MessageError>;

export type LastRequestValues = "previous" | "next" | "all";

export type Collection = {
  data: MessagePagePot;
  /** persist the last action type occurred */
  lastRequest?: LastRequestValues;
  lastUpdateTime: Date;
};

/**
 * A list of messages and pagination inbox.
 */
export type AllPaginated = {
  archive: Collection;
  inbox: Collection;
  shownCategory: MessageListCategory;
};

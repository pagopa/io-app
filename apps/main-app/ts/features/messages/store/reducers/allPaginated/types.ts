import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
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
  /** Persist the last action type occurred */
  lastRequest?: LastRequestValues;
  lastUpdateTime: Date;
};

export type MessageOperation = "archive" | "restore";
export type MessageOperationFailure = {
  error: Error;
  operation: MessageOperation;
};

/** A list of messages and pagination inbox. */
export type AllPaginated = {
  archive: Collection;
  inbox: Collection;
  latestMessageOperation?: E.Either<MessageOperationFailure, MessageOperation>;
  shownCategory: MessageListCategory;
};

/* eslint-disable @typescript-eslint/no-misused-promises */
import { CreatedMessageWithContentAndAttachments } from "@io-app/api-types/generated/definitions/communication/CreatedMessageWithContentAndAttachments";
import { PaginatedPublicMessagesCollection } from "@io-app/api-types/generated/definitions/communication/PaginatedPublicMessagesCollection";
import { PublicMessage } from "@io-app/api-types/generated/definitions/communication/PublicMessage";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import axios from "axios";
import { Router } from "express";
import * as E from "fp-ts/lib/Either";
import { promises as fsPromises } from "fs";

import { getProblemJson } from "../../../payloads/error";
import { addHandler } from "../../../payloads/response";

export const productionCrawlerRouter = Router();

export type AggregatedMessage = {
  inboxMessage: PublicMessage;
  message: CreatedMessageWithContentAndAttachments;
};

export const productionMessagesFileRelativePath = (archived: boolean) =>
  `config/productionMessages_${archived ? "archive" : "inbox"}.json`;

addHandler(
  productionCrawlerRouter,
  "get",
  "/downloadProductionMessages",
  async (req, res) => {
    const archivedQP = req.query.archived;
    const bearerTokenQP = req.query.token;
    if (bearerTokenQP == null) {
      res
        .status(400)
        .send(
          getProblemJson(400, "Bad request", "Missing 'token' query param")
        );
      return;
    }

    const archived = archivedQP === "true";
    const bearerToken = String(bearerTokenQP);

    try {
      const messageList = await downloadMessageList(
        [],
        archived,
        bearerToken,
        undefined
      );
      const aggregatedMessageList = await downloadMessagesDetails(
        bearerToken,
        0,
        messageList,
        []
      );
      await fsPromises.writeFile(
        productionMessagesFileRelativePath(archived),
        JSON.stringify(aggregatedMessageList)
      );
      res.status(200).end();
    } catch (e) {
      const message = e instanceof Error ? e.message : JSON.stringify(e);
      res
        .status(500)
        .json(getProblemJson(500, "Internal Server Error", message));
    }
  }
);

const downloadMessageList = async (
  accumulator: ReadonlyArray<PublicMessage>,
  archived: boolean,
  bearerToken: string,
  maximumId: string | undefined
): Promise<ReadonlyArray<PublicMessage>> => {
  const params = {
    enrich_result_data: true,
    page_size: 12,
    archived
  };
  const response = await axios.get(
    "https://api-app.io.pagopa.it/api/v1/messages",
    {
      params: maximumId != null ? { ...params, maximum_id: maximumId } : params,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`
      }
    }
  );
  if (response.status !== 200) {
    throw Error(`api/v1/messages/{messageId} status ${response.status}`);
  }
  const responseEither = PaginatedPublicMessagesCollection.decode(
    response.data
  );
  if (E.isLeft(responseEither)) {
    throw Error(`api/v1/messages ${readableReport(responseEither.left)}`);
  }
  const messages = responseEither.right.items;
  const accumulatedMessages = [...accumulator, ...messages];

  const next = responseEither.right.next;
  if (next == null) {
    return accumulatedMessages;
  }
  return await downloadMessageList(
    accumulatedMessages,
    archived,
    bearerToken,
    next
  );
};

const downloadMessagesDetails = async (
  bearerToken: string,
  index: number,
  messageList: ReadonlyArray<PublicMessage>,
  outputMessageList: ReadonlyArray<AggregatedMessage>
): Promise<ReadonlyArray<AggregatedMessage>> => {
  if (index >= messageList.length) {
    return outputMessageList;
  }
  const inboxMessage = messageList[index];
  const response = await axios.get(
    `https://api-app.io.pagopa.it/api/v1/messages/${inboxMessage.id}`,
    {
      params: {
        public_message: true
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`
      }
    }
  );
  if (response.status !== 200) {
    throw Error(`api/v1/messages/{messageId} status ${response.status}`);
  }
  const responseEither = CreatedMessageWithContentAndAttachments.decode(
    response.data
  );
  if (E.isLeft(responseEither)) {
    throw Error(
      `api/v1/messages/{messageId} ${readableReport(responseEither.left)}`
    );
  }
  return await downloadMessagesDetails(bearerToken, index + 1, messageList, [
    ...outputMessageList,
    { inboxMessage, message: responseEither.right }
  ]);
};

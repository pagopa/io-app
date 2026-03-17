import { v4 as uuid } from "uuid";
import {
  createClient,
  Client
} from "../../definitions/backend/communication/client";
import { KeyInfo } from "../features/lollipop/utils/crypto";
import { lollipopFetch } from "../features/lollipop/utils/fetch";
import { isDevEnv } from "../utils/environment";
import { ApiClientManager, BaseClientOptions } from "./ApiClientManager";

export type CommunicationClient = Client<"Bearer">;
export type CommunicationClientOptions = BaseClientOptions & {
  keyInfo: KeyInfo;
};

class CommunicationClientManager extends ApiClientManager<
  CommunicationClient,
  CommunicationClientOptions
> {
  protected createClient(
    baseUrl: string,
    { token, keyInfo }: CommunicationClientOptions
  ): CommunicationClient {
    return createClient({
      baseUrl,
      fetchApi: lollipopFetch({ nonce: uuid() }, keyInfo),
      withDefaults: op => params =>
        op({ Bearer: `Bearer ${token}`, ...params })
    });
  }
}

export const communicationClientManager = new CommunicationClientManager();

export const TestCommunicationClientManager = isDevEnv
  ? { CommunicationClientManager }
  : {};

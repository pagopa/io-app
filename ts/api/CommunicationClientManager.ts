 
import _ from "lodash";
import { v4 as uuid } from "uuid";
import {
  createClient,
  Client
} from "../../definitions/backend/communication/client";
import { KeyInfo } from "../features/lollipop/utils/crypto";
import { lollipopFetch } from "../features/lollipop/utils/fetch";
import { isDevEnv } from "../utils/environment";
import { ApiClientManager } from "./ApiClientManager";

export type CommunicationClient = Client<"Bearer">;

class CommunicationClientManager extends ApiClientManager<CommunicationClient> {
  protected isCacheValid(token: string, keyInfo: KeyInfo): boolean {
    return super.isCacheValid(token) && _.isEqual(this.keyInfo, keyInfo);
  }

  protected createClient(
    baseUrl: string,
    token: string,
    keyInfo: KeyInfo
  ): CommunicationClient {
    return createClient({
      baseUrl,
      fetchApi: lollipopFetch({ nonce: uuid() }, keyInfo),
      withDefaults: op => params => op({ Bearer: token, ...params })
    });
  }
}

export const communicationClientManager = new CommunicationClientManager();

export const TestCommunicationClientManager = isDevEnv
  ? { CommunicationClientManager }
  : {};

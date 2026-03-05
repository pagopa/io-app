/* eslint-disable functional/immutable-data */
import {
  createClient,
  Client
} from "../../definitions/session_manager/client";
import { KeyInfo } from "../features/lollipop/utils/crypto";
import { defaultRetryingFetch } from "../utils/fetch";
import { isDevEnv } from "../utils/environment";
import { ApiClientManager } from "./ApiClientManager";

export type SessionManagerClient = Client<"Bearer">;

class SessionManagerClientManager extends ApiClientManager<SessionManagerClient> {
  protected createClient(
    baseUrl: string,
    token: string,
    _keyInfo: KeyInfo
  ): SessionManagerClient {
    return createClient({
      baseUrl,
      fetchApi: defaultRetryingFetch(),
      withDefaults: op => params => op({ Bearer: token, ...params })
    });
  }
}

export const sessionManagerClientManager = new SessionManagerClientManager();

export const TestSessionManagerClientManager = isDevEnv
  ? { SessionManagerClientManager }
  : {};

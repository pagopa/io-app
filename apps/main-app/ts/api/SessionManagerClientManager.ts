import { Client, createClient } from "../../definitions/session_manager/client";
import { isTestEnv } from "../utils/environment";
import { defaultRetryingFetch } from "../utils/fetch";
import { ApiClientManager, BaseClientOptions } from "./ApiClientManager";

export type SessionManagerClient = Client<"Bearer">;

export type SessionManagerClientOptions = BaseClientOptions;

class SessionManagerClientManager extends ApiClientManager<
  SessionManagerClient,
  SessionManagerClientOptions
> {
  protected createClient(
    baseUrl: string,
    { token }: SessionManagerClientOptions
  ): SessionManagerClient {
    return createClient({
      baseUrl,
      fetchApi: defaultRetryingFetch(),
      withDefaults: op => params => op({ Bearer: `Bearer ${token}`, ...params })
    });
  }
}

export const sessionManagerClientManager = new SessionManagerClientManager();

export const TestSessionManagerClientManager = isTestEnv
  ? { SessionManagerClientManager }
  : {};

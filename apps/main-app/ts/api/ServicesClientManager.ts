import { Client, createClient } from "../../definitions/services/client";
import { isTestEnv } from "../utils/environment";
import { defaultRetryingFetch } from "../utils/fetch";
import { ApiClientManager, BaseClientOptions } from "./ApiClientManager";

export type ServicesClient = Client<"Bearer">;

class ServicesClientManager extends ApiClientManager<
  ServicesClient,
  BaseClientOptions
> {
  protected createClient(
    baseUrl: string,
    { token }: BaseClientOptions
  ): ServicesClient {
    return createClient({
      baseUrl,
      fetchApi: defaultRetryingFetch(),
      withDefaults: op => params => op({ Bearer: `Bearer ${token}`, ...params })
    });
  }
}

export const servicesClientManager = new ServicesClientManager();

export const TestServicesClientManager = isTestEnv
  ? { ServicesClientManager }
  : {};

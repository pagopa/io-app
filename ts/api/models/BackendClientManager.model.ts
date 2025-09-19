/* eslint-disable functional/immutable-data */
import { Nullable } from "@pagopa/io-app-design-system";
import { BackendClient } from "../backend";
import { IBackendClientManager } from "../interfaces/BackendClientManager.interface";

export abstract class BackendClientManagerModel
  implements IBackendClientManager
{
  private client: Nullable<BackendClient> = null;

  constructor(private backendClient: typeof BackendClient) {}

  getBackendClient(...args: Parameters<typeof BackendClient>): BackendClient {
    const [, token, keyInfo] = args;
    if (this.client !== null && this.client.isSameClient(token, keyInfo)) {
      return this.client;
    }

    return (this.client = this.backendClient(...args));
  }
}

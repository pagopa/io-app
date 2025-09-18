/* eslint-disable functional/immutable-data */
import { Nullable } from "@pagopa/io-app-design-system";
import { BackendClient } from "./backend";

class BackendClientManager {
  private client: Nullable<BackendClient> = null;

  getBackendClient(...args: Parameters<typeof BackendClient>): BackendClient {
    const [, token, keyInfo] = args;
    if (this.client !== null && this.client.isSameClient(token, keyInfo)) {
      return this.client;
    }

    return (this.client = BackendClient(...args));
  }
}

export const backendClientManager = new BackendClientManager();

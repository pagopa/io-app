import { BackendClient } from "../backend";

export interface IBackendClientManager {
  getBackendClient(...args: Parameters<typeof BackendClient>): BackendClient;
}

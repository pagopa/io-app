import { BackendClient } from "./backend";
import { BackendClientManagerModel } from "./models/BackendClientManager.model";

class BackendClientManager extends BackendClientManagerModel {}

export const backendClientManager = new BackendClientManager(BackendClient);

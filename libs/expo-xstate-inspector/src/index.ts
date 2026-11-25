import { createInspector } from "./inspectors/createInspector";
import { createActorRegistry } from "./registries/actorRegistry";
import { createDevToolsTransport } from "./transports/devToolsTransport";

/**
 * XState `inspect` option streaming actors to this Expo dev tools plugin.
 * Undefined in production.
 */
export const inspect = __DEV__
  ? createInspector(createDevToolsTransport(), createActorRegistry())
  : undefined;

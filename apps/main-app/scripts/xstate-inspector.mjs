import { createInspectorServer } from "@statelyai/inspect/server";

const server = createInspectorServer({ port: 8080 });
const stop = () => server.stop();
process.once("SIGINT", stop);
process.once("SIGTERM", stop);

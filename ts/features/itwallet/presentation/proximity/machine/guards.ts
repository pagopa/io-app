import { Context } from "./context";

export const createProximityGuardsImplementation = () => ({
  hasFailure: ({ context }: { context: Context }) => !!context.failure
});

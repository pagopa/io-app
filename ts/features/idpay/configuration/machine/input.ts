import { ConfigurationMode } from "../types";
import * as Context from "./context";

export interface Input {
  readonly initiativeId: string;
  readonly mode?: ConfigurationMode;
}

export const Input = (input: Input): Promise<Context.Context> =>
  Promise.resolve({
    ...Context.Context,
    initiativeId: input.initiativeId,
    mode: input.mode ?? ConfigurationMode.COMPLETE
  });

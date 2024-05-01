import * as Context from "./context";

export interface Input {
  readonly trxCode: string;
}

export const Input = (input: Input): Promise<Context.Context> =>
  Promise.resolve({ ...Context.Context, ...input });

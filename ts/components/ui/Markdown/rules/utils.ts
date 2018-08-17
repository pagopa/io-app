import { ReactNodeOutput } from "simple-markdown";

export interface ReactNativeRules {
  react_native: ReactNodeOutput;
}

export function makeReactNativeRule(f: ReactNodeOutput) {
  return {
    react_native: f
  };
}

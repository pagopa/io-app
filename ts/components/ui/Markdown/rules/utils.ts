import { ReactNodeOutput } from "simple-markdown";

export function makeReactNativeRule(f: ReactNodeOutput) {
  return {
    react_native: f
  };
}

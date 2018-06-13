import { Theme } from "../types";

declare module "native-base" {
  namespace NativeBase { interface Icon {} }
}

export default (): Theme => {
  return {};
};

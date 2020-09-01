import { Platform } from "react-native";

import { makeFontStyleObject } from "../fonts";
import { Theme } from "../types";
import variables from "../variables";

/**
 * @deprecated
 */
export default (): Theme => ({
    ...makeFontStyleObject(Platform.select, variables.h5FontWeight),
    color: variables.h5Color,
    fontSize: variables.h5FontSize,
    lineHeight: variables.h5LineHeight
  });

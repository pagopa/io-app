import * as React from "react";

import { makeReactNativeRule } from "./utils";

/**
 * A simple rule that doesn't render anything
 */
const rule = (): React.ReactNode => null;

export default makeReactNativeRule(rule);

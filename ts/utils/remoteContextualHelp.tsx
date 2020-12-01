import React from "react";
import { View } from "native-base";
import { ContextualHelpProps } from "../components/screens/BaseScreenComponent";

/**
 * Create the object needed to ensure that the Contextual Help question mark is visible
 * when the Contextual Help is filled remotely.
 *
 */
export const remoteContextualHelp = (): ContextualHelpProps => ({
  title: "",
  body: () => <View />
});

import { ContextualHelpProps } from "../components/screens/BaseScreenComponent";

/**
 * Create the object needed to ensure that the Contextual Help question mark is visible
 * when the Contextual Help is filled remotely.
 *
 */
export const emptyContextualHelp: ContextualHelpProps = {
  title: "",
  body: () => null
};

import { useLinkTo } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { extractInternalPath } from "../utils/navigation";

/**
 * This hook handles deep links. It removes the prefix and navigates to the path using the linkTo function
 * @returns a function that takes a url and navigates to the path
 */
export const useOpenDeepLink = () => {
  const linkTo = useLinkTo();

  return (url: string) =>
    pipe(extractInternalPath(url), O.fromNullable, O.map(linkTo));
};

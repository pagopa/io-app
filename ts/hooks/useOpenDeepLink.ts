import { useLinkTo } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import {
  IO_FIMS_LINK_PREFIX,
  IO_INTERNAL_LINK_PREFIX,
  IO_UNIVERSAL_LINK_PREFIX
} from "../utils/navigation";
import { extractPathFromURL } from "../utils/url";

/**
 * This hook handles deep links. It removes the prefix and navigates to the path using the linkTo function
 * @returns a function that takes a url and navigates to the path
 */
export const useOpenDeepLink = () => {
  const linkTo = useLinkTo();

  return (url: string) =>
    pipe(
      extractPathFromURL(
        [
          IO_INTERNAL_LINK_PREFIX,
          IO_UNIVERSAL_LINK_PREFIX,
          IO_FIMS_LINK_PREFIX
        ],
        url
      ),
      O.fromNullable,
      O.map(path => (path.startsWith("/") ? path : "/" + path)),
      O.map(linkTo)
    );
};

import { useLinkTo } from "@react-navigation/native";
import { handleInternalLink } from "../utils/internalLink";

/**
 * This hook handles deep links. It removes the prefix and navigates to the path using the linkTo function
 * @returns a function that takes a url and navigates to the path
 */
export const useOpenDeepLink = () => {
  const linkTo = useLinkTo();

  return (url: string) => handleInternalLink(linkTo, url);
};

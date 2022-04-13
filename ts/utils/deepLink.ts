import { Platform } from "react-native";
import { NavigationNavigateActionPayload } from "react-navigation";
import { IO_INTERNAL_LINK_PREFIX } from "../components/ui/Markdown/handlers/internalLink";

export function getNavigateActionFromDeepLink(
  url: string,
  // on Android, the URI prefix contains a host in addition to scheme
  deepLinkPrefix: string = Platform.OS === "android"
    ? `${IO_INTERNAL_LINK_PREFIX}ioit/`
    : IO_INTERNAL_LINK_PREFIX
): NavigationNavigateActionPayload {
  const route = url.slice(deepLinkPrefix.length);
  const routeParts = route.split("/");
  const routeName = routeParts[0];
  const id = routeParts[1] || undefined;

  // FIXME: whitelist allowed routes
  return { routeName, params: { id } };
}

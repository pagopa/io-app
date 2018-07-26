import { NavigationNavigateActionPayload } from "react-navigation";
import ROUTES from "../navigation/routes";

export function getNavigationPayloadFromDeepLink(
  url: string
): NavigationNavigateActionPayload {
  const route = url.slice(ROUTES.PREFIX.length);
  const routeParts = route.split("/");
  const routeName = routeParts[0];
  const id = routeParts[1] || undefined;

  return { routeName, params: { id } };
}

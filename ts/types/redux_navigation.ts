import { NavigationScreenComponent } from "react-navigation";

/**
 * Helper type for safe casting a redux mapped component to a component
 * suitable for be configured in a `NavigationRouteConfigMap`.
 *
 * This is necessary due to some limitation in the react-navigation types defs:
 * `NavigationRouteConfigMap` wants the `screen` property to refer to a
 * `NavigationScreenComponent<any, any, any>` - when we wrap a component with
 * Redux's `connect` we get a type that cannot be cast automatically by
 * typescript to `NavigationScreenComponent<any, any, any>`.
 *
 * Example:
 *
 * ```
 * [ROUTES.MESSAGES_LIST]: {
 *   screen: MessagesScreen as SafeNavigationScreenComponent<
 *     typeof MessagesScreen
 *   >
 * },
 * ```
 */
export type SafeNavigationScreenComponent<
  T
> = T extends NavigationScreenComponent<infer T1, infer T2, infer T3>
  ? NavigationScreenComponent<any, any, any>
  : T;

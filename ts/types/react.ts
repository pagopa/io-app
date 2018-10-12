import { Component, ComponentType, StatelessComponent } from "react";
import {
  NavigationInjectedProps,
  NavigationScreenProps
} from "react-navigation";

/**
 * Evaluates to the Props type of a React component
 */
export type ComponentProps<C> = C extends StatelessComponent<infer P1>
  ? P1
  : C extends Component<infer P2>
    ? P2
    : C extends ComponentType<infer P3> ? P3 : never;

/**
 * Infers the type of the navigation params of a component
 */
export type InferNavigationParams<
  C,
  P = ComponentProps<C>
> = P extends NavigationInjectedProps<infer N>
  ? N
  : P extends NavigationScreenProps<infer N1> ? N1 : never;

import { Component, ComponentType, StatelessComponent } from "react";

/**
 * Evaluates the Props type of React component
 */
export type ComponentProps<C> = C extends StatelessComponent<infer P1>
  ? P1
  : C extends Component<infer P2>
  ? P2
  : C extends ComponentType<infer P3>
  ? P3
  : never;

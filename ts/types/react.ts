import { ComponentType } from "react";

/**
 * Evaluates to the Props type of a React component
 */
export type ComponentProps<C> = C extends ComponentType<infer P> ? P : never;

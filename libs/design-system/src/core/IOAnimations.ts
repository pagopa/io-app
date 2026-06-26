import {
  cubicBezier,
  type CSSAnimationTimingFunction
} from "react-native-reanimated";

/**
 * A collection of animation styles used for interactive elements within IO App.
 */

export const IOEasingCurves = {
  easeInOutSine: cubicBezier(0.37, 0, 0.63, 1),
  easeInOutCubic: cubicBezier(0.65, 0, 0.35, 1)
} satisfies Record<string, CSSAnimationTimingFunction>;

export type IOEasingCurves = keyof typeof IOEasingCurves;

export const IOSpringValues = {
  /* Used by Reanimated package */
  button: {
    damping: 20,
    mass: 0.5,
    stiffness: 300
  },
  accordion: {
    damping: 30,
    mass: 1,
    stiffness: 325
  },
  /* Used by selection items (checkbox, radio, etc…) */
  selection: {
    damping: 10,
    mass: 0.5,
    stiffness: 200
  },
  header: {
    damping: 10,
    mass: 0.5,
    stiffness: 200
  }
};

export type IOSpringValues = keyof typeof IOSpringValues;

export const IOScaleEffect = {
  // Slight scale effect
  slight: 0.99,
  // Medium scale effect
  medium: 0.97,
  // Exaggerated scale effect
  exaggerated: 0.95
};

export type IOScaleEffect = keyof typeof IOScaleEffect;

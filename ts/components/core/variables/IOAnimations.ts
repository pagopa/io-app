/**
 * A collection of animation styles used for interactive elements within IO App.
 */

export const IOSpringValues = {
  /* Used by Reanimated package */
  button: {
    damping: 20,
    mass: 0.5,
    stiffness: 300
  },
  /* Used by selection items (checkbox, radio, etc…) */
  selection: {
    damping: 10,
    mass: 0.5,
    stiffness: 200
  }
};

export const IOScaleValues = {
  // Slight scale effect
  basicButton: {
    pressedState: 0.99
  },
  // Medium scale effect
  magnifiedButton: {
    pressedState: 0.97
  },
  // Exaggerated scale effect
  exaggeratedButton: {
    pressedState: 0.95
  }
};

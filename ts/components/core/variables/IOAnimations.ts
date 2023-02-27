/**
 * A collection of animation styles used for interactive elements within IO App.
 */

export const IOSpringValues = {
  /* Used by react-reanimated package.
  For reference: https://docs.swmansion.com/react-native-reanimated/docs/2.3.x/api/animations/withSpring */
  button: {
    damping: 20,
    mass: 0.5,
    stiffness: 300
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

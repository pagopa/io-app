export const MIN_ZOOM = 0.1;

export const MAX_ZOOM = 4;

export const ZOOM_STEP = 1.25;

// Clamps mouse wheel notches so they zoom about as fast as trackpad pinches.
export const MAX_WHEEL_DELTA = 25;

export const WHEEL_ZOOM_SPEED = 0.01;

export const FIT_MARGIN = 16;

// Following starts with the focused state filling this share of the viewport,
// but no closer than natural size so its neighbours stay in view.
export const FOLLOW_FOCUS_RATIO = 0.25;

export const FOLLOW_MAX_ZOOM = 1;

// A press moving at most this many pixels selects instead of panning.
export const MAX_TAP_DISTANCE = 4;

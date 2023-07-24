/**
 * The maximum number of toasts that can be displayed at the same time
 * If the number of the toasts exceeds this number, the oldest one will be removed
 */
export const MAX_TOAST_STACK_SIZE = 3;

/**
 * The time in milliseconds that a toast notification will be displayed
 */
export const TOAST_DURATION_TIME = 5000;

/**
 * This will throttle the toast notifications to avoid displaying too many of them at the same time
 */
export const TOAST_THROTTLE_TIME = 500;

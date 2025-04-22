import * as Sentry from "@sentry/react-native";

export function itwSendExceptionToSentry(exception: unknown, message: string) {
  Sentry.captureException(exception);
  Sentry.captureMessage(message);
}

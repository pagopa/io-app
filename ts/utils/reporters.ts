import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { Context, ValidationError } from "io-ts";
import { Reporter } from "io-ts/lib/Reporter";

/**
 * Translate a context to a more readable path.
 *
 * e.g.:
 *
 *   "is not a non empty string"
 *   ".a is not a number"
 *   ".c.b is not a non empty string"
 */
function getContextPath(context: Context): string {
  const keysPath = context.map(({ key }) => key).join(".");
  const lastType = context[context.length - 1]
    ? context[context.length - 1].type
    : undefined;

  if (lastType === undefined || lastType.name === "never") {
    return `${keysPath}] is not a known property`;
  }

  return `${keysPath}] is not a valid [${lastType.name}]`;
}

function getMessage(_: unknown, context: Context): string {
  return `some value at [root${getContextPath(context)}`;
}

/**
 * Translates validation errors to more readable messages.
 */
export function errorsToReadableMessages(
  es: ReadonlyArray<ValidationError>
): ReadonlyArray<string> {
  return es.map(e => getMessage(e.value, e.context));
}

function success(): ReadonlyArray<string> {
  return ["No errors!"];
}

export function readablePrivacyReport(
  errors: ReadonlyArray<ValidationError>
): string {
  return errorsToReadableMessages(errors).join("\n");
}

/**
 * A validation error reporter that translates validation errors to more
 * readable messages.
 */
export const ReadableReporter: Reporter<ReadonlyArray<string>> = {
  report: validation =>
    pipe(validation, E.fold(errorsToReadableMessages, success))
};

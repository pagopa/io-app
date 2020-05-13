import { fromNullable } from "fp-ts/lib/Option";
import { createTransform, TransformIn, TransformOut } from "redux-persist";
import { DateFromISOString } from "../../utils/dates";

/**
 * dateFieldsTransformable contains the name of the fields that are
 * instance of Date and those ones we want to persist/rehydrate in redux persist store
 *
 * actually entities state (whitelisted in this transform) contains these following date (Timestamp) fields
 *
 * EntitiesState
 *  - MessageState
 *    - CreatedMessageWithContent
 *      - created_at *
 *      - content
 *        - due_date *
 *    - CreatedMessageWithoutContent
 *      - created_at *
 *
 * https://www.pivotaltracker.com/story/show/167507349
 */
const dateFieldsTransformable = new Set<string>([
  "created_at",
  "due_date",
  "nextLegalAttempt"
]);

/**
 *  if value is a Date object, a string in ISO8601 format is returned
 */

const dataReplacer = (_: any, value: any): any => {
  if (value !== undefined && value instanceof Date) {
    return value.toISOString();
  }
  return value;
};

/**
 *  if value is in a string in ISO8601 format the corrisponding Date object is returned
 */
const dateReviver = (key: any, value: any): any => {
  const decodedValue = DateFromISOString.decode(value);
  return dateFieldsTransformable.has(key) && decodedValue.isRight()
    ? decodedValue.value
    : value;
};

const encoder: TransformIn<any, string> = (value: any, _: string): any =>
  fromNullable(value).fold(undefined, v =>
    JSON.parse(JSON.stringify(v), dataReplacer)
  );

const decoder: TransformOut<string, any> = (value: any, _: string): any =>
  fromNullable(value).fold(undefined, v =>
    JSON.parse(JSON.stringify(v), dateReviver)
  );

/**
 * date tasformer will be applied only to entities (whitelist)
 */
export const DateISO8601Transform = createTransform(encoder, decoder, {
  whitelist: ["entities", "fail"]
});

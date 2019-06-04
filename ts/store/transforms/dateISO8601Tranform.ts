import { createTransform, TransformIn, TransformOut } from "redux-persist";

/**
 *  if value is in a Date object a string in ISO8601 format is returned
 */

const dataReplacer = (_: any, value: any): any => {
  if (value !== undefined && value instanceof Date) {
    return value.toISOString();
  }
  return value;
};

/**
 *  if value is in ISO8601 format the corrisponding Date object is returned
 */
const dateReviver = (_: any, value: any): any => {
  if (
    typeof value === "string" &&
    value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  ) {
    return new Date(value);
  }
  return value;
};

/**
 * The given object is traversed throught all its fields and if one of them
 * is a string in the ISO8601 format it will be converted to a Date object
 */
const encoder: TransformIn<any, string> = (value: any, _: string): any =>
  JSON.parse(JSON.stringify(value), dataReplacer);

/**
 * if one of object's field is a string representing a string in ISO8601 format
 * it will be converted to a string simplified extended ISO format (ISO 8601)
 */
const decoder: TransformOut<string, any> = (value: any, _: string): any =>
  JSON.parse(JSON.stringify(value), dateReviver);

/**
 * date tasformer will be applied only to entities (whitelist)
 */
export const DateISO8601Transform = createTransform(encoder, decoder, {
  whitelist: ["entities"]
});

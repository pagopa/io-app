import { createTransform, TransformIn, TransformOut } from "redux-persist";
import { DateFromISOString } from "../../utils/dates";

/**
 *  if value is a Date object, a string in ISO8601 format is returned
 */

const dataReplacer = (_: any, value: any): any => {
  if (value !== undefined && value instanceof Date) {
    return DateFromISOString.encode(value);
  }
  return value;
};

/**
 *  if value is in a string in ISO8601 format the corrisponding Date object is returned
 */
const dateReviver = (_: any, value: any): any => {
  const decodedValue = DateFromISOString.decode(value);
  return decodedValue.isRight() ? decodedValue.value : value;
};

const encoder: TransformIn<any, string> = (value: any, _: string): any =>
  JSON.parse(JSON.stringify(value), dataReplacer);

const decoder: TransformOut<string, any> = (value: any, _: string): any =>
  JSON.parse(JSON.stringify(value), dateReviver);

/**
 * date tasformer will be applied only to entities (whitelist)
 */
export const DateISO8601Transform = createTransform(encoder, decoder, {
  whitelist: ["entities"]
});

import { createTransform, TransformIn, TransformOut } from "redux-persist";

const isObject = (obj: any): boolean => typeof obj === "object";

/**
 * traverse the given object and where a inner field holds a Date object
 * the value will be replaced with the corrisponding string in ISO8601 format
 */
const encodeDateToISO8601String = (obj: any) => {
  if (!isObject(obj)) {
    return obj;
  }
  Object.keys(obj).forEach(key => {
    if (isObject(obj[key])) {
      // tslint:disable-next-line: no-object-mutation
      obj[key] = encodeDateToISO8601String(obj[key]);
      return;
    }
    if (obj[key] instanceof Date) {
      // tslint:disable-next-line: no-object-mutation
      obj[key] = obj[key].toISOString();
    }
  });
  return obj;
};

/**
 * traverse the given object and where a inner field holds a string in
 * ISO8601 format the value will be replaced with the corrisponding Date object
 */
const decodeISO8601StringToDate = (obj: any) => {
  if (!isObject(obj)) {
    return obj;
  }
  Object.keys(obj).forEach(key => {
    if (isObject(obj[key])) {
      // tslint:disable-next-line: no-object-mutation
      obj[key] = decodeISO8601StringToDate(obj[key]);
      return;
    }
    if (
      typeof obj[key] === "string" &&
      obj[key].match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    ) {
      // tslint:disable-next-line: no-object-mutation
      obj[key] = new Date(obj[key]);
    }
  });
  return obj;
};

/**
 * The given object is traversed throught all its fields and if one of them
 * is a string in the ISO8601 format it will be converted to a Date object
 */
const encoder: TransformIn<any, string> = (value: any, _: string): any =>
  decodeISO8601StringToDate(value);

/**
 * The given object is traversed throught all its fields and if one of them
 * is a Date in the ISO8601 format it will be converted to a string simplified
 * extended ISO format (ISO 8601)
 */
const decoder: TransformOut<string, any> = (value: any, _: string): any =>
  encodeDateToISO8601String(value);

/**
 * date tasformer will be applied only to entities (whitelist)
 */
export const DateISO8601Transform = createTransform(encoder, decoder, {
  whitelist: ["entities"]
});

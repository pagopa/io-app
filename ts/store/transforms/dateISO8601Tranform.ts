import { createTransform, TransformIn, TransformOut } from "redux-persist";
import { MessageState } from "../reducers/entities/messages/messagesById";

// If value is a date object it will be converted to a string simplified extended ISO format (ISO 8601)
const replacer = (_: string, value: any): string | any =>
  value instanceof Date ? value.toISOString() : value;

// If the stored string is a date in the ISO8601 format it will be converted to a Date object
const reviver = (_: string, value: any): Date | any =>
  typeof value === "string" &&
  value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    ? new Date(value)
    : value;

const encoder: TransformIn<MessageState, string> = (
  value: any,
  _: string
): any => JSON.stringify(value, replacer);

const decoder: TransformOut<string, any> = (value: any, _: string): any =>
  JSON.parse(value, reviver);

export const DateISO8601Transform = createTransform(encoder, decoder);

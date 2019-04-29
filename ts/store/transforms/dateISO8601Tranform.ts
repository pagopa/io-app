import { createTransform, TransformIn, TransformOut } from "redux-persist";
import { MessageState } from "../reducers/entities/messages/messagesById";

// check if the value is a date object, if yes it will be converted in a string
// simplified extended ISO format (ISO 8601), otherwise it returns the value
const replacer = (_: string, value: any): string | any =>
  value instanceof Date ? value.toISOString() : value;

// check if the stored value is a string respecting the ISO 8101 representation
// if yes it will be converted in a Date object, otherwise it returns the value
const reviver = (_: string, value: any): Date | any =>
  typeof value === "string" &&
  value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    ? new Date(value)
    : value;

const encoder: TransformIn<MessageState, string> = (
  value: any,
  _: string
): any => {
  return JSON.stringify(value, replacer);
};

const decoder: TransformOut<string, any> = (value: any, _: string): any => {
  return JSON.parse(value, reviver);
};

export const DateISO8601Transform = createTransform(encoder, decoder);

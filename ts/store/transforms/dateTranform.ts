import { createTransform, TransformIn, TransformOut } from "redux-persist";
import { MessageState } from "../reducers/entities/messages/messagesById";

const replacer = (_: string, value: any): string | any => {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
  // return value instanceof Date ? value.toISOString() : value;
};

const reviver = (_: string, value: any): Date | any => {
  if (
    typeof value === "string" &&
    value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  ) {
    return new Date(value);
  }
  return value;
};

const encoder: TransformIn<MessageState, string> = (
  value: any,
  _: string
): any => {
  return JSON.stringify(value, replacer);
};

const decoder: TransformOut<string, any> = (value: any, _: string): any => {
  return JSON.parse(value, reviver);
};

export const DateTransform = createTransform(encoder, decoder);

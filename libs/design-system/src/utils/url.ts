import { ImageURISource } from "react-native";

/**
 * type guard to check if a value is an ImageURISource
 * @argument value the value to check, can be anything
 * @returns boolean
 */
export const isImageUri = (value: unknown): value is ImageURISource =>
  typeof value === "object" && value !== null && "uri" in value;

import { ImageURISource } from "react-native";

/**
 * Type guard to check if a value is an ImageURISource
 *
 * @param value The value to check, can be anything
 * @returns Boolean
 */
export const isImageUri = (value: unknown): value is ImageURISource =>
  typeof value === "object" && value !== null && "uri" in value;

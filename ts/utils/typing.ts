import * as t from "io-ts";

/**
 * @param - an object and its literal type (keyof typeof obj)
 * @returns an io-ts decoder for the keys of the object
 * @example {icon1:jsx, icon2:jsx, icon3:jsx}
 * returns a validator for "icon1" | "icon2" | "icon3"
 */
export const keysDecoderFromObject = <LiteralType extends string>(obj: {
  [key: string]: any;
}) => {
  const entriesArray = Object.keys(obj) as any as ReadonlyArray<LiteralType>;

  const keyObject = <T extends ReadonlyArray<string>>(
    arr: T
  ): { [K in T[number]]: null } =>
    Object.fromEntries(arr.map(v => [v, null])) as any;

  return t.keyof(keyObject(entriesArray));
};

// These extensions were created based on a comment in an issue on io-ts repository
// Issue link: https://github.com/gcanti/io-ts/issues/338#issuecomment-1472770728

/* eslint-disable no-underscore-dangle */
/* eslint-disable functional/immutable-data */
import * as t from "io-ts";

/**
 * Helper function to extract the properties of a given io-ts codec.
 * @param codec - The io-ts codec from which to extract properties.
 * @returns The properties of the io-ts codec.
 */
function getProps<T extends t.HasProps>(codec: T): t.TypeOf<T> {
  switch (codec._tag) {
    case "RefinementType":
    case "ReadonlyType":
      return getProps(codec.type);
    case "InterfaceType":
    case "StrictType":
    case "PartialType":
      return codec.props;
    case "IntersectionType":
      return codec.types.reduce<t.TypeOf<T>>(
        (props, type) => Object.assign(props, getProps(type)),
        {}
      );
    default:
      throw new TypeError("Invalid codec");
  }
}

/**
 * Omit specified properties from an io-ts codec.
 * @param codec - The io-ts codec from which to omit properties.
 * @param keys - The key or array of keys to omit.
 * @returns A new io-ts codec with specified properties omitted.
 */
export const omitProps = <C extends t.HasProps, K extends keyof t.TypeOf<C>>(
  codec: C,
  keys: K | Array<K>
): t.Type<Omit<t.TypeOf<C>, K>> &
  Pick<t.InterfaceType<unknown>, "_tag" | "props"> => {
  const initialProps = getProps(codec);

  const props: Omit<t.TypeOf<C>, K> = (
    Array.isArray(keys) ? keys : [keys]
  ).reduce((acc, key) => {
    const { [key]: _prop, ...rest } = acc;
    return rest;
  }, initialProps);

  return t.type(props);
};

/**
 * Pick specified properties from an io-ts codec.
 * @param codec - The io-ts codec from which to pick properties.
 * @param keys - The key or array of keys to pick.
 * @returns A new io-ts codec with specified properties picked.
 */
export const pickProps = <C extends t.HasProps, K extends keyof t.TypeOf<C>>(
  codec: C,
  keys: K | Array<K>
): t.Type<Pick<t.TypeOf<C>, K>> &
  Pick<t.InterfaceType<unknown>, "_tag" | "props"> => {
  const initialProps = getProps(codec);

  const props = (Array.isArray(keys) ? keys : [keys]).reduce((acc, key) => {
    const { [key]: prop } = initialProps;
    return { ...acc, prop };
  }, {} as Pick<t.TypeOf<C>, K>);

  return t.type(props);
};

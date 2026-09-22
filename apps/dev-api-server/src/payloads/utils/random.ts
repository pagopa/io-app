/**
 * Returns a random value from an enum.
 */
export const getRandomEnumValue = <T extends object>(
  enumObj: T
): T[keyof T] => {
  const enumValues = Object.values(enumObj);
  const index = Math.floor(Math.random() * enumValues.length);

  return enumValues[index];
};

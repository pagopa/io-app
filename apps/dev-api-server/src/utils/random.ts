import { ioDevServerConfig } from "../config";
import { AllorRandomValueKeys } from "../types/config";

type RandomValueFunc = <T>(
  defaultValue: T,
  randomValue: T,
  configSectionKey: AllorRandomValueKeys
) => T;

const getValueGlobalRandomOff: RandomValueFunc = <T>(defaultValue: T) =>
  defaultValue;

const getValueGlobalRandomOn: RandomValueFunc = <T>(
  defaultValue: T,
  randomValue: T,
  configSectionKey: AllorRandomValueKeys
) => {
  const isDefaultValueUndefined = defaultValue === undefined;
  if ("allowRandomValues" in ioDevServerConfig[configSectionKey]) {
    return ioDevServerConfig[configSectionKey].allowRandomValues ||
      isDefaultValueUndefined
      ? randomValue
      : defaultValue;
  }
  return isDefaultValueUndefined ? randomValue : defaultValue;
};

/**
 * if global random (allowRandomValues) is OFF this will be a function that will always return the default value
 * otherwise it will be a function that checks if random is enabled for that specific section (if it is omitted if, random is allowed by default)
 * if the specific random section is enabled then the random value will be returned, the default value otherwise
 */
export const getRandomValue: RandomValueFunc = ioDevServerConfig.global
  .allowRandomValues
  ? getValueGlobalRandomOn
  : getValueGlobalRandomOff;

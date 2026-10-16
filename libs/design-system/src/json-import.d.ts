/**
 * Allow import of json files.
 *
 * Ex: import jsonFile from '../file.json`
 *
 * More @https://hackernoon.com/import-json-into-typescript-8d465beded79
 */

declare module "*.json" {
  const value: any;
  export default value;
}

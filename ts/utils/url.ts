/**
 * Generic utilities for url parsing
 */

/**
 * Return the base name of a remote resource from a give path
 * @param resourceUrl the remote resource url
 * @param includeExt if true include the extension part of the resource
 */
export function getResourceNameFromUrl(
  resourceUrl: string,
  includeExt: boolean = false
): string {
  let splitted = resourceUrl.split("/");
  let resourceName = splitted[splitted.length - 1].toLowerCase();
  return includeExt ? resourceName : resourceName.split(".")[0];
}

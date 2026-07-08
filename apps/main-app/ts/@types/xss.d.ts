declare module "xss" {
  export type FilterXSSOptions = any;

  /**
   * Filter xss function
   *
   * @param {String} html
   * @param {Object} options { whiteList, onTag, onTagAttr, onIgnoreTag,
   *   onIgnoreTagAttr, safeAttrValue, escapeHtml }
   * @returns {String}
   */
  export function filterXSS(html: string, options?: FilterXSSOptions): string;
}

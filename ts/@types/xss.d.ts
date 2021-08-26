declare module "xss" {
  import { FilterXSS } from "xss";
  export type FilterXSSOptions = any;

  /**
   * filter xss function
   *
   * @param {String} html
   * @param {Object} options { whiteList, onTag, onTagAttr, onIgnoreTag, onIgnoreTagAttr, safeAttrValue, escapeHtml }
   * @return {String}
   */
  export function filterXSS(html: string, options?: FilterXSSOptions): string {
    const xss = new FilterXSS(options);
    return xss.process(html);
  }
}

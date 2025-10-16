/* eslint-disable */
import { remark } from "remark";
import remarkDirective from "remark-directive";
import remarkRehype from "remark-rehype";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { h } from "hastscript";

// This Plugin is used to convert the markdown directives to custom blocks including classes and ids
// source https://github.com/remarkjs/remark-directive#use
function customPlugin() {
  return (tree: any) => {
    visit(tree, node => {
      if (
        node.type === "textDirective" ||
        node.type === "leafDirective" ||
        node.type === "containerDirective"
      ) {
        const data = node.data || (node.data = {});
        const hast = h(node.name, node.attributes);

        data.hName = hast.tagName;
        data.hProperties = hast.properties;
      }
    });
  };
}

export const remarkProcessor = remark()
  .use(remarkDirective)
  .use(customPlugin) // @ts-ignore
  .use(remarkRehype) // @ts-ignore
  .use(rehypeFormat) // @ts-ignore
  .use(rehypeStringify) // @ts-ignore
  .use(remarkDirective);

export const markdownToPlainText = (md: string): string =>
  md
    .replace(/```[\s\S]*?```|`([^`]*)`/g, "$1") // remove code blocks + inline code
    .replace(/!\[.*?\]\(.*?\)|\[(.*?)\]\(.*?\)/g, "$1") // images & links
    .replace(/[*_~>#-]+/gm, "") // remove markdown symbols
    .replace(/<\/?[^>]+>/g, "") // remove HTML tags
    .replace(/\s{2,}/g, " ") // collapse spaces
    .replace(/\n{2,}/g, "\n") // collapse blank lines
    .trim();

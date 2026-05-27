/* eslint-disable functional/immutable-data */
import { remark } from "remark";
import remarkDirective from "remark-directive";
import remarkRehype from "remark-rehype";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { h } from "hastscript";
import { Root } from "mdast";

// This Plugin is used to convert the markdown directives to custom blocks including classes and ids
// source https://github.com/remarkjs/remark-directive#use
function customPlugin() {
  return (tree: Root) => {
    visit(tree, node => {
      if (
        node.type === "textDirective" ||
        node.type === "leafDirective" ||
        node.type === "containerDirective"
      ) {
        const data = node.data || (node.data = {});
        const hast = h(node.name, node.attributes);

        // @ts-expect-error type mismatch
        data.hName = hast.tagName;
        // @ts-expect-error type mismatch
        data.hProperties = hast.properties;
      }
    });
  };
}

/* eslint-disable @typescript-eslint/ban-ts-comment */
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

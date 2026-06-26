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

        data.hName = hast.tagName;
        data.hProperties = hast.properties;
      }
    });
  };
}

export const remarkProcessor = remark()
  .use(remarkDirective)
  .use(customPlugin)
  .use(remarkRehype)
  .use(rehypeFormat)
  .use(rehypeStringify)
  .use(remarkDirective);

export const markdownToPlainText = (md: string): string =>
  md
    .replace(/```[\s\S]*?```|`([^`]*)`/g, "$1") // remove code blocks + inline code
    .replace(/!\[.*?\]\(.*?\)|\[(.*?)\]\(.*?\)/g, "$1") // images & links
    // Remove HTML tags before stripping markdown symbols (which also removes
    // `>`). `[^>]*` swallows any nested `<` and `>?` makes the closing bracket
    // optional, so a single pass consumes every `<` and cannot leave residual
    // characters that re-form a tag (e.g. `<scr<script>ipt>`).
    .replace(/<[^>]*>?/g, "")
    .replace(/[*_~>#-]+/gm, "") // remove markdown symbols
    .replace(/\s{2,}/g, " ") // collapse spaces
    .replace(/\n{2,}/g, "\n") // collapse blank lines
    .trim();

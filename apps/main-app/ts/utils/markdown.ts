export const markdownToPlainText = (md: string): string =>
  md
    .replace(/```[\s\S]*?```|`([^`]*)`/g, "$1") // remove code blocks + inline code
    .replace(/!\[.*?\]\(.*?\)|\[(.*?)\]\(.*?\)/g, "$1") // images & links
    .replace(/[*_~>#-]+/gm, "") // remove markdown symbols
    .replace(/<\/?[^>]+>/g, "") // remove HTML tags
    .replace(/\s{2,}/g, " ") // collapse spaces
    .replace(/\n{2,}/g, "\n") // collapse blank lines
    .trim();

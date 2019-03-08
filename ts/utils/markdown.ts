import remark from "remark";
import remarkCustomBlocks from "remark-custom-blocks";
import remarkHtml from "remark-html";

// Configuration fo remark-custom-blocks
const REMARK_CUSTOM_BLOCKS_CONFIG = {
  "IO-DEMO": {
    classes: "io-demo-block"
  }
};

export const remarkProcessor = remark()
  .use(remarkCustomBlocks, REMARK_CUSTOM_BLOCKS_CONFIG)
  .use(remarkHtml);

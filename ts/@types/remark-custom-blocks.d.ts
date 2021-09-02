declare module "remark-custom-blocks" {
  type AvailableBlock = {
    title: string;
    details: string;
    containerElement: string;
    contentsElement: string;
    classes: string;
    titleElement: string;
  };

  type AvailableBlocks = { [index: string]: AvailableBlock };

  export default function blockPlugin(
    availableBlocks: AvailableBlocks = {}
  ): void;
}

declare module "react-native-barcode-builder" {
  import { oneOf } from "fp-ts/lib/Foldable2v";
  import { api } from "jsbarcode/jsbarcode";
  import { PureComponent } from "react";

  export interface BarcodeProps {
    background?: string;
    format?: barcodeTypes;
    height?: number;
    lineColor?: string;
    onError?: () => void;
    text?: string;
    value: string;
    width?: number;
  }
  // For not included barcode format, if required,
  // review rules on value to encode as barcode
  type barcodeTypes = "CODE39" | "CODE128" | "CODE128A" | "CODE128B";

  export default class Barcode extends React.PureComponent<BarcodeProps> {
    constructor(props);
  }
}

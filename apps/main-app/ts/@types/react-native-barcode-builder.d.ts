declare module "react-native-barcode-builder" {
  // For not included barcode format, if required,
  // review rules on value to encode as barcode
  type barcodeTypes = "CODE39" | "CODE128" | "CODE128A" | "CODE128B";
  export interface BarcodeProps {
    value: string;
    width?: number;
    height?: number;
    background?: string;
    format?: barcodeTypes;
    text?: string;
    lineColor?: string;
    onError?: () => void;
  }

  export default class Barcode extends React.PureComponent<BarcodeProps> {
    constructor(props);
  }
}

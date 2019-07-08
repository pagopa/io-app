declare module "react-native-barcode-builder" {
    import { PureComponent } from "react";
    import { oneOf } from "fp-ts/lib/Foldable2v";
    import { api } from "jsbarcode/jsbarcode";

    type barcodeTypes = "CODE39" |
        "CODE128" | 
        "CODE128A" | 
        "CODE128B" | 
        "CODE128C" |
        "EAN13"| 
        "EAN8" | 
        "EAN5" | 
        "EAN2" | 
        "UPC" | 
        "UPCE" |
	    "ITF14" |
	    "ITF" |
        "MSI" | 
        "MSI10" | 
        "MSI11" | 
        "MSI1010" | 
        "MSI1110" |
	    "pharmacode" |
	    "codabar" |
	    "GenericBarcode";

    export interface BarcodeProps {
        value: string;
        width?: number;
        height?: number;
        background?: string;
        format: barcodeTypes;
        text?: string;
        lineColor?: string;
        onError?: () => void;
    }

    export default class Barcode extends React.PureComponent<BarcodeProps>{
        constructor(props);
    }
}

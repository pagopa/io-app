declare module 'react-native-barcode-builder' {
    import { PureComponent } from "react";

    export interface BarcodeProps {
        value: string;
        width?: number;
        height?: number;
        background?: string;
        format: string;
        text?: string;
        lineColor?: string;
        onError?: () => void;
    }

    export default class Barcode extends React.PureComponent<BarcodeProps>{
        constructor(props);
    }
}

/**
 * *Bare essential* to get things building
 */
declare module "react-native-qrcode-scanner" {
  export type Props = Readonly<{
    onRead?: (e: { data: string }) => void;
    reactivate?: boolean;
    reactivateTimeout?: number;
    fadeIn?: boolean;
    showMarker?: boolean;
    cameraType?: "front" | "back";
    customMarker?: React.ReactElement;
    containerStyle?: any;
    cameraStyle?: any;
    topViewStyle?: any;
    bottomViewStyle?: any;
    topContent?: React.ReactElement | string;
    bottomContent?: React.ReactElement | string;
    notAuthorizedView?: React.ReactElement;
    permissionDialogTitle?: string;
    permissionDialogMessage?: string;
    checkAndroid6Permissions?: boolean;
  }>;

  export default class QRCodeScanner extends React.Component<Props> {}
}

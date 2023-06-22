import * as A from "fp-ts/lib/Array";
import * as TO from "fp-ts/lib/TaskOption";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { Alert, Linking } from "react-native";
import * as ImagePicker from "react-native-image-picker";
import { ImageLibraryOptions } from "react-native-image-picker";
import RNQRGenerator from "rn-qr-generator";
import I18n from "../../../../../i18n";
import { AsyncAlert } from "../../../../../utils/asyncAlert";
import { isAndroid } from "../../../../../utils/platform";
import { IOBarcode } from "./IOBarcode";

type IOBarcodeReaderConfiguration = {
  onInvalidQrCode: () => void;
  onBarcodeScanned?: (barcode: IOBarcode) => void;
};

const imageLibraryOptions: ImageLibraryOptions = {
  mediaType: "photo"
};

const useIOBarcodeReader = (config: IOBarcodeReaderConfiguration) => {
  /**
   * Opens the settings page to allow user to change the settings
   */
  const openAppSettings = async () => {
    await Linking.openSettings();
  };

  const onImageSelected = (response: ImagePicker.ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }

    if (response.errorCode === "permission") {
      Alert.alert(
        I18n.t("wallet.QRtoPay.settingsAlert.title"),
        I18n.t("wallet.QRtoPay.settingsAlert.message"),
        [
          {
            text: I18n.t("wallet.QRtoPay.settingsAlert.buttonText.cancel"),
            style: "cancel"
          },
          {
            text: I18n.t("wallet.QRtoPay.settingsAlert.buttonText.settings"),
            onPress: openAppSettings
          }
        ],
        { cancelable: false }
      );
      return;
    }

    pipe(
      response.assets,
      O.fromNullable,
      O.chain(assets => A.head(assets)),
      O.chain(asset => O.fromNullable(asset.uri)),
      O.map(uri =>
        RNQRGenerator.detect({ uri })
          .then(data => {
            if (data.values.length === 0) {
              config.onInvalidQrCode();
              return;
            }
            config.onBarcodeScanned?.({
              format: "QR_CODE",
              value: data.values[0],
              type: "IDPAY"
            });
          })
          .catch(config.onInvalidQrCode)
      )
    );
  };

  const showImagePicker = async () => {
    // on Android we have to show a prominent disclosure on how we use READ_EXTERNAL_STORAGE permission
    // see https://pagopa.atlassian.net/wiki/spaces/IOAPP/pages/444727486/2021-11-18+Android#2021-12-08
    if (isAndroid) {
      await AsyncAlert(
        I18n.t("wallet.QRtoPay.readStorageDisclosure.title"),
        I18n.t("wallet.QRtoPay.readStorageDisclosure.message"),
        [
          {
            text: I18n.t("global.buttons.choose"),
            style: "default"
          }
        ]
      );
    }

    ImagePicker.launchImageLibrary(imageLibraryOptions, onImageSelected);
  };

  return {
    showImagePicker
  };
};

export { useIOBarcodeReader };

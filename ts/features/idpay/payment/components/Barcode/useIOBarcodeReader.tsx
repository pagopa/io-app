import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { Alert, Linking } from "react-native";
import * as ImagePicker from "react-native-image-picker";
import { ImageLibraryOptions } from "react-native-image-picker";
import RNQRGenerator from "rn-qr-generator";
import I18n from "../../../../../i18n";
import { AsyncAlert } from "../../../../../utils/asyncAlert";
import { isAndroid } from "../../../../../utils/platform";
import { IOBarcode, getIOBarcodeType } from "./IOBarcode";

type IOBarcodeReader = {
  showImagePicker: () => void;
};

type IOBarcodeReaderConfiguration = {
  onBarcodeError?: () => void;
  onBarcodeScanned?: (barcode: IOBarcode) => void;
};

const imageLibraryOptions: ImageLibraryOptions = {
  mediaType: "photo"
};

const useIOBarcodeReader = (
  config: IOBarcodeReaderConfiguration
): IOBarcodeReader => {
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
      O.chain(A.head),
      O.chain(({ uri }) => O.fromNullable(uri)),
      O.map(uri =>
        RNQRGenerator.detect({ uri })
          .then(detectedData =>
            pipe(
              sequenceS(O.Monad)({
                onBarcodeScanned: O.fromNullable(config.onBarcodeScanned),
                value: pipe(
                  detectedData.values,
                  A.head,
                  O.fromNullable,
                  O.flatten
                )
              }),
              O.map(({ onBarcodeScanned, value }) => {
                const type = getIOBarcodeType(value);

                onBarcodeScanned({
                  format: "QR_CODE",
                  value,
                  type
                });
              })
            )
          )
          .catch(config.onBarcodeError)
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

import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { Alert, Linking } from "react-native";
import DocumentPicker, {
  DocumentPickerOptions,
  DocumentPickerResponse,
  types
} from "react-native-document-picker";
import * as ImagePicker from "react-native-image-picker";
import { ImageLibraryOptions } from "react-native-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import RNQRGenerator, { CodeType as RNQRCodeType } from "rn-qr-generator";
import { Divider } from "../../../../../components/core/Divider";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import ListItemNav from "../../../../../components/ui/ListItemNav";
import I18n from "../../../../../i18n";
import { AsyncAlert } from "../../../../../utils/asyncAlert";
import { useIOBottomSheetAutoresizableModal } from "../../../../../utils/hooks/bottomSheet";
import { isAndroid } from "../../../../../utils/platform";
import { DecodedIOBarcode, decodeIOBarcode } from "./decoders";
import { IOBarcode, IOBarcodeFormat } from "./IOBarcode";

/**
 * Maps internal formats to external library formats
 * Necessary to work with the library {@link rn-qr-generator}
 */
const IOBarcodeFormats: { [K in IOBarcodeFormat]: RNQRCodeType } = {
  DATA_MATRIX: "DataMatrix",
  QR_CODE: "QRCode"
};

/**
 * Utility functions to map external formats to internal formats
 * Converts {@link RNQRCodeType} to {@link IOBarcodeFormat}.
 * Returns undefined if no format is found
 */
const convertToIOBarcodeFormat = (
  format: RNQRCodeType
): IOBarcodeFormat | undefined =>
  (Object.keys(IOBarcodeFormats) as Array<IOBarcodeFormat>).find(
    key => IOBarcodeFormats[key] === format
  );

type IOBarcodeFileReader = {
  /**
   * Shows the image picker that lets the user select an image from the library
   */
  showImagePicker: () => void;
  /**
   * Shows the document picker that lets the user select a PDF document from the library
   */
  showDocumentPicker: () => void;
  /**
   * Component that renders the bottom sheet with the options to select an image or a PDF document
   * from the library
   */
  filePickerBottomSheet: React.ReactElement;
  /**
   * Shows the {@link filePickerBottomSheet} bottom sheet components
   */
  showFilePickerModal: () => void;
};

type IOBarcodeFileReaderConfiguration = {
  /**
   * Callback called when a barcode is successfully decoded
   */
  onBarcodeSuccess: (barcode: IOBarcode) => void;
  /**
   * Callback called when a barcode is not successfully decoded
   */
  onBarcodeError: () => void;
};

const imageLibraryOptions: ImageLibraryOptions = {
  mediaType: "photo"
};

const documentPickerOptions: DocumentPickerOptions<"ios" | "android"> = {
  presentationStyle: "fullScreen",
  copyTo: "cachesDirectory",
  mode: "open",
  type: [types.pdf]
};

const useIOBarcodeFileReader = (
  config: IOBarcodeFileReaderConfiguration
): IOBarcodeFileReader => {
  const { onBarcodeSuccess, onBarcodeError } = config;

  /**
   * Handles the image Barcode decoding.
   * If successful, calls {@link onBarcodeSuccess} callback.
   * If unsuccessful, calls {@link onBarcodeError} callback.
   */
  const imageDecodingTask = (imageUri: string) =>
    pipe(
      TE.tryCatch(
        () => RNQRGenerator.detect({ uri: imageUri }),
        () => onBarcodeError()
      ),
      TE.map(data => {
        const barcodeFormat = convertToIOBarcodeFormat(data.type);

        if (!barcodeFormat) {
          // Format not supported
          return onBarcodeError();
        }

        pipe(
          A.head(data.values),
          O.map(decodeIOBarcode),
          O.map<DecodedIOBarcode, IOBarcode>(decodedBarcode => ({
            format: barcodeFormat,
            ...decodedBarcode
          })),
          O.map(onBarcodeSuccess),
          O.getOrElse(onBarcodeError)
        );
      })
    );

  /**
   * Handles the selected image from the image picker and pass the asset to the {@link qrCodeFromImageTask} task
   */
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
            onPress: Linking.openSettings
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
      O.map(({ uri }) => uri),
      O.chain(O.fromNullable),
      O.map(imageUri => imageDecodingTask(imageUri)())
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

  /**
   * Handles the Barcode decoding from a PDF document
   */
  const onDocumentSelected = (response: DocumentPickerResponse) => {
    if (response.type === "application/pdf") {
      alert("TODO :)");
    }
  };

  /**
   * Shows the document picker that lets the user select a PDF document from the library
   */
  const showDocumentPicker = async () => {
    await pipe(
      TE.tryCatch(
        () => DocumentPicker.pickSingle(documentPickerOptions),
        E.toError
      ),
      TE.map(onDocumentSelected)
    )();
  };

  /**
   * Components that renders the bottom sheet with the options to select an image or a PDF document
   */
  const filePickerModalComponent = (
    <SafeAreaView>
      <ListItemNav
        value="Carica un'immagine"
        accessibilityLabel="Carica un'immagine"
        onPress={async () => {
          filePickerModal.dismiss();
          await showImagePicker();
        }}
        icon="gallery"
      />
      <Divider />
      <ListItemNav
        value="Carica un file"
        accessibilityLabel="Carica un file"
        onPress={async () => {
          filePickerModal.dismiss();
          await showDocumentPicker();
        }}
        icon="docAttach"
      />
      <VSpacer size={16} />
    </SafeAreaView>
  );

  const filePickerModal = useIOBottomSheetAutoresizableModal({
    component: filePickerModalComponent,
    title: ""
  });

  return {
    showImagePicker,
    showDocumentPicker,
    filePickerBottomSheet: filePickerModal.bottomSheet,
    showFilePickerModal: filePickerModal.present
  };
};

export { useIOBarcodeFileReader };

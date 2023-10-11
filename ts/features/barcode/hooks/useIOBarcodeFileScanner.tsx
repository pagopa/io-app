import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { Alert, Linking, View } from "react-native";
import DocumentPicker, {
  DocumentPickerOptions,
  DocumentPickerResponse,
  types
} from "react-native-document-picker";
import * as ImagePicker from "react-native-image-picker";
import { ImageLibraryOptions } from "react-native-image-picker";
import { Divider, ListItemNav, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";
import { AsyncAlert } from "../../../utils/asyncAlert";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import * as Platform from "../../../utils/platform";
import { IOBarcode, IOBarcodeFormat, IOBarcodeType } from "../types/IOBarcode";
import { BarcodeFailure } from "../types/failure";
import { imageDecodingTask } from "../utils/imageDecodingTask";
import { imageGenerationTask } from "../utils/imageGenerationTask";
import { getUniqueBarcodes } from "../utils/getUniqueBarcodes";

type IOBarcodeFileScanner = {
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
   * Shows the {@link filePickerBottomSheet} bottom sheet component
   */
  showFilePicker: () => void;
};

type IOBarcodeFileScannerConfiguration = {
  /**
   * Accepted barcoded formats that can be detected. Leave empty to accept all formats.
   * If the format is not supported it will return an UNSUPPORTED_FORMAT error
   */
  barcodeFormats?: Array<IOBarcodeFormat>;
  /**
   * Accepted barcode types that can be detected. Leave empty to accept all types.
   * If the type is not supported it will return an UNKNOWN_CONTENT error
   */
  barcodeTypes?: Array<IOBarcodeType>;
  /**
   * Callback called when there is at least one barcode being successfully decoded
   */
  onBarcodeSuccess: (barcodes: Array<IOBarcode>) => void;
  /**
   * Callback called when a barcode is not successfully decoded
   */
  onBarcodeError: (failure: BarcodeFailure) => void;
};

const imageLibraryOptions: ImageLibraryOptions = {
  mediaType: "photo",
  includeBase64: true
};

const documentPickerOptions: DocumentPickerOptions<"ios" | "android"> = {
  presentationStyle: "fullScreen",
  mode: "open",
  type: [types.pdf]
};

const useIOBarcodeFileScanner = ({
  onBarcodeError,
  onBarcodeSuccess,
  barcodeFormats,
  barcodeTypes
}: IOBarcodeFileScannerConfiguration): IOBarcodeFileScanner => {
  /**
   * Handles the selected image from the image picker and pass the asset to the {@link qrCodeFromImageTask} task
   */
  const onImageSelected = async (response: ImagePicker.ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }

    if (response.errorCode) {
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

    await pipe(
      response.assets,
      O.fromNullable,
      O.chain(A.head),
      O.map(({ base64 }) => base64),
      O.chain(O.fromNullable),
      TE.fromOption<BarcodeFailure>(() => ({ reason: "INVALID_FILE" })),
      TE.chain(base64 =>
        imageDecodingTask({ base64 }, barcodeFormats, barcodeTypes)
      ),
      TE.mapLeft(onBarcodeError),
      TE.map(onBarcodeSuccess)
    )();
  };

  const showImagePicker = async () => {
    // on Android we have to show a prominent disclosure on how we use READ_EXTERNAL_STORAGE permission
    // see https://pagopa.atlassian.net/wiki/spaces/IOAPP/pages/444727486/2021-11-18+Android#2021-12-08
    if (Platform.isAndroid) {
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

    void ImagePicker.launchImageLibrary(imageLibraryOptions, onImageSelected);
  };

  /**
   * Handles the Barcode decoding from a PDF document
   */
  const onDocumentSelected = async ({ uri, type }: DocumentPickerResponse) => {
    if (type !== "application/pdf") {
      // If the file is not a PDF document, show an error
      return onBarcodeError({ reason: "INVALID_FILE" });
    }

    await pipe(
      imageGenerationTask(uri),
      TE.map(
        A.reduce(
          Promise.resolve([] as Array<IOBarcode>),
          async (barcodes, { uri }) =>
            pipe(
              imageDecodingTask({ uri }, barcodeFormats, barcodeTypes),
              TE.map(async decodedBarcodes => [
                ...(await barcodes),
                ...decodedBarcodes
              ]),
              TE.getOrElse(() => T.of(barcodes))
            )()
        )
      ),
      TE.map(async barcodes =>
        pipe(
          await barcodes,
          O.of,
          O.filter(A.isNonEmpty),
          O.map(getUniqueBarcodes),
          O.map(onBarcodeSuccess),
          O.getOrElse(() => onBarcodeError({ reason: "BARCODE_NOT_FOUND" }))
        )
      )
    )();
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
    <View>
      <ListItemNav
        value={I18n.t("barcodeScan.upload.image")}
        accessibilityLabel={I18n.t("barcodeScan.upload.image")}
        onPress={async () => {
          filePickerModal.dismiss();
          await showImagePicker();
        }}
        icon="gallery"
      />
      <Divider />
      <ListItemNav
        value={I18n.t("barcodeScan.upload.file")}
        accessibilityLabel={I18n.t("barcodeScan.upload.file")}
        onPress={async () => {
          filePickerModal.dismiss();
          await showDocumentPicker();
        }}
        icon="docAttach"
      />
      <VSpacer size={16} />
    </View>
  );

  const filePickerModal = useIOBottomSheetAutoresizableModal({
    component: filePickerModalComponent,
    title: ""
  });

  return {
    showImagePicker,
    showDocumentPicker,
    filePickerBottomSheet: filePickerModal.bottomSheet,
    showFilePicker: filePickerModal.present
  };
};

export { useIOBarcodeFileScanner };

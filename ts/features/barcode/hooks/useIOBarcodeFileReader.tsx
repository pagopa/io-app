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
import PdfThumbnail, { ThumbnailResult } from "react-native-pdf-thumbnail";
import RNQRGenerator, {
  QRCodeScanResult,
  CodeType as RNQRCodeType
} from "rn-qr-generator";
import { Divider } from "../../../components/core/Divider";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import ListItemNav from "../../../components/ui/ListItemNav";
import I18n from "../../../i18n";
import { AsyncAlert } from "../../../utils/asyncAlert";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import * as Platform from "../../../utils/platform";
import { IOBarcode, IOBarcodeFormat } from "../types/IOBarcode";
import { decodeIOBarcode } from "../types/decoders";
import { BarcodeFailure } from "../types/failure";

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
): O.Option<IOBarcodeFormat> =>
  pipe(
    Object.entries(IOBarcodeFormats),
    A.findFirst(([_, value]) => value === format),
    O.map(([key, _]) => key as IOBarcodeFormat)
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
   * Shows the {@link filePickerBottomSheet} bottom sheet component
   */
  showFilePicker: () => void;
};

type IOBarcodeFileReaderConfiguration = {
  /**
   * Accepted barcoded formats that can be detected. Leave empty to accept all formats.
   * If the format is not supported it will return an UNSUPPORTED_FORMAT error
   */
  formats?: Array<IOBarcodeFormat>;
  /**
   * Callback called when a barcode is successfully decoded
   */
  onBarcodeSuccess: (barcode: IOBarcode) => void;
  /**
   * Callback called when a barcode is not successfully decoded
   */
  onBarcodeError: (failure: BarcodeFailure) => void;
};

const imageLibraryOptions: ImageLibraryOptions = {
  mediaType: "photo"
};

const documentPickerOptions: DocumentPickerOptions<"ios" | "android"> = {
  presentationStyle: "fullScreen",
  mode: "open",
  type: [types.pdf]
};

/**
 * Creates a TaskEither that detects the QR code from an image URI
 * @param imageUri
 * @returns
 */
const qrCodeDetectionTask = (
  imageUri: string
): TE.TaskEither<BarcodeFailure, QRCodeScanResult> =>
  TE.tryCatch(
    () => RNQRGenerator.detect({ uri: imageUri }),
    () => ({ reason: "UNEXPECTED" })
  );

/**
 * Creates a TaskEither that generates all the images from a PDF document
 * @param pdfUri
 * @returns
 */
const imageGenerationTask = (
  pdfUri: string
): TE.TaskEither<BarcodeFailure, Array<ThumbnailResult>> =>
  TE.tryCatch(
    () => PdfThumbnail.generateAllPages(pdfUri, 100),
    () => ({ reason: "UNEXPECTED" })
  );

/**
 * Creates a TaskEither that decodes a barcodes from an image URI
 * @param imageUri
 * @param acceptedFormats The accepted formats of the barcodes
 * @returns
 */
const imageDecodingTask = (
  imageUri: string,
  acceptedFormats?: Array<IOBarcodeFormat>
): TE.TaskEither<BarcodeFailure, IOBarcode> =>
  pipe(
    qrCodeDetectionTask(imageUri),
    TE.chain(result =>
      pipe(
        A.head(result.values),
        TE.fromOption<BarcodeFailure>(() => ({ reason: "BARCODE_NOT_FOUND" })),
        TE.map(() => result)
      )
    ),
    TE.chain(result =>
      pipe(
        convertToIOBarcodeFormat(result.type),
        O.filter(format => acceptedFormats?.includes(format) ?? true),
        O.map(format => [result, format] as const),
        TE.fromOption<BarcodeFailure>(() => ({ reason: "UNSUPPORTED_FORMAT" }))
      )
    ),
    TE.chain(([result, format]) =>
      pipe(
        // FIXME Currently, we only support one barcode per image
        // Extract the first barcode if any barcode is found
        A.head(result.values),
        TE.fromOption<BarcodeFailure>(() => ({ reason: "BARCODE_NOT_FOUND" })),
        TE.chain(content =>
          pipe(
            content,
            O.of,
            O.chain(decodeIOBarcode),
            O.map(decodedBarcode => ({
              format,
              ...decodedBarcode
            })),
            TE.fromOption<BarcodeFailure>(() => ({
              reason: "UNKNOWN_CONTENT",
              format,
              content
            }))
          )
        )
      )
    )
  );

const useIOBarcodeFileReader = (
  config: IOBarcodeFileReaderConfiguration
): IOBarcodeFileReader => {
  const { onBarcodeSuccess, onBarcodeError } = config;

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
      O.map(({ uri }) => uri),
      O.chain(O.fromNullable),
      TE.fromOption<BarcodeFailure>(() => ({ reason: "INVALID_FILE" })),
      TE.chain(uri => imageDecodingTask(uri, config.formats)),
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
              imageDecodingTask(uri, config.formats),
              TE.map(async barcode => [...(await barcodes), barcode]),
              TE.getOrElse(() => T.of(barcodes))
            )()
        )
      ),
      // FIXME Currently, we only support one barcode per PDF document
      // Extract the first barcode if any barcode is found
      TE.map(async barcodes =>
        pipe(
          await barcodes,
          A.head,
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

export { useIOBarcodeFileReader };

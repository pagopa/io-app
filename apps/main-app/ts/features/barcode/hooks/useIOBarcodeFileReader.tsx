import { Divider, ListItemNav, VSpacer } from "@io-app/design-system";
import {
  DocumentPickerAsset,
  DocumentPickerOptions,
  getDocumentAsync
} from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import I18n from "i18next";
import { JSX, useState } from "react";
import { Alert, Linking, View } from "react-native";

import { useIOStore } from "../../../store/hooks";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import {
  BarcodeAnalyticsFlow,
  trackBarcodeFileUpload,
  trackBarcodeImageUpload,
  trackBarcodeUploadPath
} from "../analytics";
import { BarcodeFailure } from "../types/failure";
import {
  IOBarcode,
  IOBarcodeFormat,
  IOBarcodeOrigin,
  IOBarcodeType
} from "../types/IOBarcode";
import { getUniqueBarcodes } from "../utils/getUniqueBarcodes";
import { imageDecodingTask } from "../utils/imageDecodingTask";
import { imageGenerationTask } from "../utils/imageGenerationTask";

type IOBarcodeFileReader = {
  /**
   * Component which displays the bottom sheet to chosse which type of file tu
   * upload (image or document)
   */
  filePickerBottomSheet: JSX.Element;
  /** Indicates whether file picker bottom sheet is currently being showed or not */
  isFilePickerVisible: boolean;
  /** Indicates that the decoder is currently reading/decoding barcodes */
  isLoading: boolean;
  /**
   * Shows the document picker that lets the user select a PDF document from the
   * library
   */
  showDocumentPicker: () => void;
  /** Function which toggle the visibility filePickerBottomSheet compoentn */
  showFilePicker: () => void;
  /** Shows the image picker that lets the user select an image from the library */
  showImagePicker: () => void;
};

type IOBarcodeFileReaderConfiguration = {
  /** Mixpanel analytics parameters */
  barcodeAnalyticsFlow: BarcodeAnalyticsFlow;
  /**
   * Accepted barcoded formats that can be detected. Leave empty to accept all
   * formats. If the format is not supported it will return an
   * UNSUPPORTED_FORMAT error
   */
  barcodeFormats?: Array<IOBarcodeFormat>;
  /**
   * Accepted barcode types that can be detected. Leave empty to accept all
   * types. If the type is not supported it will return an UNKNOWN_CONTENT
   * error
   */
  barcodeTypes?: Array<IOBarcodeType>;
  /** Callback called when a barcode is not successfully decoded */
  onBarcodeError: (failure: BarcodeFailure, origin: IOBarcodeOrigin) => void;
  /**
   * Callback called when there is at least one barcode being successfully
   * decoded
   */
  onBarcodeSuccess: (
    barcodes: Array<IOBarcode>,
    origin: IOBarcodeOrigin
  ) => void;
};

const imageLibraryOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: "images",
  base64: true
};

const documentPickerOptions: DocumentPickerOptions = {
  type: "application/pdf",
  copyToCacheDirectory: true
};

const useIOBarcodeFileReader = ({
  onBarcodeError,
  onBarcodeSuccess,
  barcodeFormats,
  barcodeTypes,
  barcodeAnalyticsFlow
}: IOBarcodeFileReaderConfiguration): IOBarcodeFileReader => {
  const store = useIOStore();
  const [isFilePickerVisible, setFilePickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBarcodeSuccess = (barcodes: Array<IOBarcode>) => {
    setIsLoading(false);
    onBarcodeSuccess(barcodes, "file");
  };

  const handleBarcodeError = (failure: BarcodeFailure) => {
    setIsLoading(false);
    onBarcodeError(failure, "file");
  };

  /**
   * Handles the selected image from the image picker and pass the asset to the
   * {@link qrCodeFromImageTask} task
   */
  const onImageSelected = async (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    await pipe(
      result.assets,
      O.fromNullable,
      O.chain(A.head),
      O.map(({ base64 }) => base64),
      O.chain(O.fromNullable),
      TE.fromOption<BarcodeFailure>(() => ({ reason: "INVALID_FILE" })),
      TE.chain(base64 =>
        imageDecodingTask(
          store.getState(),
          { base64 },
          barcodeFormats,
          barcodeTypes
        )
      ),
      TE.mapLeft(handleBarcodeError),
      TE.map(handleBarcodeSuccess)
    )();
  };

  const showImagePicker = async () => {
    setIsLoading(true);

    try {
      const result =
        await ImagePicker.launchImageLibraryAsync(imageLibraryOptions);
      await onImageSelected(result);
    } catch {
      setIsLoading(false);
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
            onPress: () => void Linking.openSettings()
          }
        ],
        { cancelable: false }
      );
    }
  };

  /** Handles the Barcode decoding from a PDF document */
  const onDocumentSelected = async (asset: DocumentPickerAsset) => {
    const { uri, mimeType } = asset;

    if (mimeType !== "application/pdf") {
      // If the file is not a PDF document, show an error
      return onBarcodeError({ reason: "INVALID_FILE" }, "file");
    }

    setIsLoading(true);

    await pipe(
      imageGenerationTask(uri),
      TE.map(
        A.reduce(
          Promise.resolve([] as Array<IOBarcode>),
          async (barcodes, { uri: internalUri }) =>
            pipe(
              imageDecodingTask(
                store.getState(),
                { uri: internalUri },
                barcodeFormats,
                barcodeTypes
              ),
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
          O.map(handleBarcodeSuccess),
          O.getOrElse(() => handleBarcodeError({ reason: "BARCODE_NOT_FOUND" }))
        )
      )
    )();
  };

  /**
   * Shows the document picker that lets the user select a PDF document from the
   * library
   */
  const showDocumentPicker = async () => {
    setIsLoading(true);
    try {
      const result = await getDocumentAsync(documentPickerOptions);
      if (result.canceled || result.assets.length === 0) {
        setIsLoading(false);
        return;
      }
      void onDocumentSelected(result.assets[0]);
    } catch {
      setIsLoading(false);
    }
  };

  const handleImageUploadPressed = async () => {
    trackBarcodeImageUpload(barcodeAnalyticsFlow);
    filePickerModal.dismiss();
    await showImagePicker();
  };

  const handleFileUploadPressed = async () => {
    trackBarcodeFileUpload(barcodeAnalyticsFlow);
    filePickerModal.dismiss();
    await showDocumentPicker();
  };

  /**
   * Components that renders the bottom sheet with the options to select an
   * image or a PDF document
   */
  const filePickerModalComponent = (
    <View>
      <ListItemNav
        accessibilityLabel={I18n.t("barcodeScan.upload.image")}
        icon="gallery"
        onPress={() => void handleImageUploadPressed()}
        value={I18n.t("barcodeScan.upload.image")}
      />
      <Divider />
      <ListItemNav
        accessibilityLabel={I18n.t("barcodeScan.upload.file")}
        icon="docAttach"
        onPress={() => void handleFileUploadPressed()}
        value={I18n.t("barcodeScan.upload.file")}
      />
      <VSpacer size={16} />
    </View>
  );

  const filePickerModal = useIOBottomSheetModal({
    component: filePickerModalComponent,
    title: "",
    onDismiss: () => setFilePickerVisible(false)
  });

  const handleShowFilePickerPressed = () => {
    trackBarcodeUploadPath(barcodeAnalyticsFlow);
    setFilePickerVisible(true);
    filePickerModal.present();
  };

  return {
    showImagePicker: () => void showImagePicker(),
    showDocumentPicker: () => void showDocumentPicker(),
    filePickerBottomSheet: filePickerModal.bottomSheet,
    showFilePicker: handleShowFilePickerPressed,
    isLoading,
    isFilePickerVisible
  };
};

export { useIOBarcodeFileReader };

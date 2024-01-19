import { Divider, ListItemNav, VSpacer } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
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
import I18n from "../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import { requestMediaPermission } from "../../../utils/permission";
import {
  BarcodeAnalyticsFlow,
  trackBarcodeFileUpload,
  trackBarcodeImageUpload,
  trackBarcodeUploadPath
} from "../analytics";
import {
  IOBarcode,
  IOBarcodeFormat,
  IOBarcodeOrigin,
  IOBarcodeType
} from "../types/IOBarcode";
import { BarcodeFailure } from "../types/failure";
import { getUniqueBarcodes } from "../utils/getUniqueBarcodes";
import { imageDecodingTask } from "../utils/imageDecodingTask";
import { imageGenerationTask } from "../utils/imageGenerationTask";

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
   * Function which toggle the visibility filePickerBottomSheet compoentn
   */
  showFilePicker: () => void;
  /**
   * Component which displays the bottom sheet to chosse which type of file tu upload (image or document)
   */
  filePickerBottomSheet: JSX.Element;
  /**
   * Indicates that the decoder is currently reading/decoding barcodes
   */
  isLoading: boolean;
  /**
   * Indicates whether file picker bottom sheet is currently being showed or not
   */
  isFilePickerVisible: boolean;
};

type IOBarcodeFileReaderConfiguration = {
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
  onBarcodeSuccess: (
    barcodes: Array<IOBarcode>,
    origin: IOBarcodeOrigin
  ) => void;
  /**
   * Callback called when a barcode is not successfully decoded
   */
  onBarcodeError: (failure: BarcodeFailure, origin: IOBarcodeOrigin) => void;
  /**
   * Mixpanel analytics parameters
   */
  barcodeAnalyticsFlow: BarcodeAnalyticsFlow;
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

const useIOBarcodeFileReader = ({
  onBarcodeError,
  onBarcodeSuccess,
  barcodeFormats,
  barcodeTypes,
  barcodeAnalyticsFlow
}: IOBarcodeFileReaderConfiguration): IOBarcodeFileReader => {
  const [isFilePickerVisible, setFilePickerVisible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const handleBarcodeSuccess = (barcodes: Array<IOBarcode>) => {
    setIsLoading(false);
    onBarcodeSuccess(barcodes, "file");
  };

  const handleBarcodeError = (failure: BarcodeFailure) => {
    setIsLoading(false);
    onBarcodeError(failure, "file");
  };

  /**
   * Handles the selected image from the image picker and pass the asset to the {@link qrCodeFromImageTask} task
   */
  const onImageSelected = async (response: ImagePicker.ImagePickerResponse) => {
    if (response.didCancel) {
      setIsLoading(false);
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

    setIsLoading(true);

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
      TE.mapLeft(handleBarcodeError),
      TE.map(handleBarcodeSuccess)
    )();
  };

  const showImagePicker = async () => {
    const permissionGranted = await requestMediaPermission();
    if (!permissionGranted) {
      navigation.navigate(ROUTES.GALLERY_PERMISSION_INSTRUCTIONS);
      return;
    }

    setIsLoading(true);

    void ImagePicker.launchImageLibrary(imageLibraryOptions, onImageSelected);
  };

  /**
   * Handles the Barcode decoding from a PDF document
   */
  const onDocumentSelected = async ({ uri, type }: DocumentPickerResponse) => {
    if (type !== "application/pdf") {
      // If the file is not a PDF document, show an error
      return onBarcodeError({ reason: "INVALID_FILE" }, "file");
    }

    setIsLoading(true);

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
          O.map(handleBarcodeSuccess),
          O.getOrElse(() => handleBarcodeError({ reason: "BARCODE_NOT_FOUND" }))
        )
      )
    )();
  };

  /**
   * Shows the document picker that lets the user select a PDF document from the library
   */
  const showDocumentPicker = async () => {
    setIsLoading(true);
    await pipe(
      TE.tryCatch(
        () => DocumentPicker.pickSingle(documentPickerOptions),
        E.toError
      ),
      TE.map(onDocumentSelected),
      TE.mapLeft(() => setIsLoading(false))
    )();
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
   * Components that renders the bottom sheet with the options to select an image or a PDF document
   */
  const filePickerModalComponent = (
    <View>
      <ListItemNav
        value={I18n.t("barcodeScan.upload.image")}
        accessibilityLabel={I18n.t("barcodeScan.upload.image")}
        onPress={handleImageUploadPressed}
        icon="gallery"
      />
      <Divider />
      <ListItemNav
        value={I18n.t("barcodeScan.upload.file")}
        accessibilityLabel={I18n.t("barcodeScan.upload.file")}
        onPress={handleFileUploadPressed}
        icon="docAttach"
      />
      <VSpacer size={16} />
    </View>
  );

  const filePickerModal = useIOBottomSheetAutoresizableModal({
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
    showImagePicker,
    showDocumentPicker,
    filePickerBottomSheet: filePickerModal.bottomSheet,
    showFilePicker: handleShowFilePickerPressed,
    isLoading,
    isFilePickerVisible
  };
};

export { useIOBarcodeFileReader };

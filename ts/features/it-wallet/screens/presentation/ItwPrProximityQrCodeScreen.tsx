import * as React from "react";
import {
  Image,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  View
} from "react-native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import RNQRGenerator from "rn-qr-generator";
import {
  IOStyles,
  IconButton,
  LabelSmall,
  LoadingSpinner,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import {
  DocumentRequest,
  EventData,
  ProximityManager
} from "@pagopa/io-react-native-proximity";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import I18n from "../../../../i18n";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import ItwKoView from "../../components/ItwKoView";
import { getItwGenericMappedError } from "../../utils/itwErrorsUtils";
import { mockedmDLResponse } from "../../utils/mocks";
import ItwContinueView from "../../components/ItwContinueView";
import ROUTES from "../../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  ProximityManagerStatusEnum,
  startProximityManager,
  stopProximityManager
} from "../../store/actions/itwProximityActions";
import {
  proximityStatusSelector,
  qrcodeSelector
} from "../../store/reducers/itwProximityReducer";

/**
 * A screen that shows a QR code to be scanned by the other device
 * in order to start the proximity flow.
 */
const ItwPrProximityQrCodeScreen = () => {
  const [qrCodeUri, setQrCodeUri] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [eventMessage, setEventMessage] = React.useState("");
  const [isError, setIsError] = React.useState(false);
  const [isProximityCompleted, setIsProximityCompleted] = React.useState(false);
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const dispatch = useIODispatch();
  const proximityStatus = useIOSelector(proximityStatusSelector);
  const qrCode = useIOSelector(qrcodeSelector);

  useOnFirstRender(() => {
    handleAndroidPermissions().catch(_ => setIsError(true));
    dispatch(
      startProximityManager.request({
        onSuccess,
        onError,
        onEvent,
        onDocumentsRequestReceived
      })
    );
  });

  const generateQrCode = React.useCallback(() => {
    if (pot.isSome(qrCode)) {
      RNQRGenerator.generate({
        value: qrCode.value,
        height: 300,
        width: 300,
        correctionLevel: "H"
      })
        .then(async response => {
          setQrCodeUri(response.uri);
          setIsLoading(true);
          await ProximityManager.startScan();
        })
        .catch(_ => {
          setIsError(true);
        });
    } else {
      setIsError(true);
    }
  }, [qrCode]);

  React.useEffect(() => {
    if (proximityStatus === ProximityManagerStatusEnum.STARTED) {
      setIsLoading(false);
      generateQrCode();
    }
  }, [generateQrCode, proximityStatus]);

  /**
   * This is a temporary function to map the event to a message
   * to be displayed to the user. The messages will be replaced
   * by a locale when and if will be available by design.
   * @todo replace the messages with a locale when and if will be available by design or
   * remove this function if no messages required.
   * @param event
   * @returns
   */
  const mapEventToMessage = (event: EventData) => {
    switch (event.type) {
      case "ON_BLE_START":
        return I18n.t(
          "features.itWallet.presentation.qrCodeScreen.proximity.start"
        );
      case "ON_BLE_STOP":
        return I18n.t(
          "features.itWallet.presentation.qrCodeScreen.proximity.stop"
        );
      case "ON_PERIPHERAL_CONNECTED":
        return I18n.t(
          "features.itWallet.presentation.qrCodeScreen.proximity.peripheralConnected"
        );
      case "ON_SESSION_ESTABLISHMENT":
        return I18n.t(
          "features.itWallet.presentation.qrCodeScreen.proximity.sessionEstablished"
        );
      case "ON_DOCUMENT_REQUESTS_RECEIVED":
        return I18n.t(
          "features.itWallet.presentation.qrCodeScreen.proximity.documentRequestReceived"
        );
      case "ON_DOCUMENT_PRESENTATION_COMPLETED":
        setIsProximityCompleted(true);
        return I18n.t(
          "features.itWallet.presentation.qrCodeScreen.proximity.documentPresentationCompleted"
        );
        break;
      default:
        return "";
    }
  };

  const onEvent = (event: EventData) => {
    setEventMessage(mapEventToMessage(event));
  };

  const onSuccess = (_: EventData) => {
    // TODO: handle success event
  };

  const onError = (_: EventData) => {
    setIsError(true);
  };

  const onDocumentsRequestReceived = (_: Array<DocumentRequest>) => {
    // TODO: maybe should be navigate to a data sharing
    // screen to get user consent
    ProximityManager.dataPresentation(mockedmDLResponse).catch(_ => {
      setIsError(true);
    });
  };

  const handleAndroidPermissions = async () => {
    if (
      Platform.OS === "android" &&
      Platform.Version >= 31 &&
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN &&
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
    ) {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      ]);
    } else if (
      Platform.OS === "android" &&
      Platform.Version >= 23 &&
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    ) {
      await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      ).then(async checkResult => {
        if (
          !checkResult &&
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        ) {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
        }
      });
    }
  };

  /**
   * This component is used to display a loading spinner and a text.
   * It is used during proximity flow. After proximity integration [SIW-688] this
   * component could show a message to the user related to the several steps
   * of the proximity flow.
   * @returns a loading component which displays a loading spinner and a text.
   */
  const LoadingComponent = () => (
    <View style={IOStyles.alignCenter}>
      <LoadingSpinner />
      <VSpacer size={8} />
      <LabelSmall color={"black"} weight="Regular">
        {eventMessage}
      </LabelSmall>
    </View>
  );

  /**
   * Error view component which currently displays a generic error.
   */
  const ErrorView = () => {
    const mappedError = getItwGenericMappedError(() => navigation.goBack());
    return <ItwKoView {...mappedError} />;
  };

  if (isError) {
    dispatch(stopProximityManager.request());
    return <ErrorView />;
  }

  if (isProximityCompleted) {
    dispatch(stopProximityManager.request());
    return (
      <ItwContinueView
        title={I18n.t(
          "features.itWallet.presentation.qrCodeScreen.proximity.documentPresentationCompleted"
        )}
        pictogram={"success"}
        action={{
          label: I18n.t("global.buttons.confirm"),
          accessibilityLabel: I18n.t("global.buttons.confirm"),
          onPress: () =>
            navigation.navigate(ROUTES.MAIN, { screen: ROUTES.ITWALLET_HOME })
        }}
      />
    );
  }

  const customGoBack: React.ReactElement = (
    <IconButton
      icon={Platform.OS === "ios" ? "backiOS" : "backAndroid"}
      color={"neutral"}
      onPress={() => {
        dispatch(stopProximityManager.request());
        navigation.goBack();
      }}
      accessibilityLabel={I18n.t("global.buttons.back")}
    />
  );

  return (
    <BaseScreenComponent goBack={true} customGoBack={customGoBack}>
      <SafeAreaView style={(IOStyles.flex, IOStyles.alignCenter)}>
        <View
          style={{
            marginTop: 48,
            alignItems: "center"
          }}
        >
          {qrCodeUri !== "" && (
            <>
              <LabelSmall color={"black"}>
                {I18n.t("features.itWallet.presentation.qrCodeScreen.title")}
              </LabelSmall>
              <VSpacer size={16} />
              <Image
                style={{ width: 300, height: 300 }}
                source={{ uri: qrCodeUri }}
              />
              <VSpacer size={32} />
              {isLoading && <LoadingComponent />}
            </>
          )}
        </View>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ItwPrProximityQrCodeScreen;

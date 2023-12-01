import * as React from "react";
import { Image, SafeAreaView, View } from "react-native";
import RNQRGenerator from "rn-qr-generator";
import {
  IOStyles,
  LabelSmall,
  LoadingSpinner,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import I18n from "../../../../i18n";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import ItwKoView from "../../components/ItwKoView";
import { getItwGenericMappedError } from "../../utils/itwErrorsUtils";

// A mocked QR code to be used in the proximity flow
// TODO: remove this mocked QR code after the proximity flow is implemented [SIW-688]
const mockedQrCode =
  "mdoc:owBjMS4wAYIB2BhYS6QBAiABIVggUCnUgO0nCmTWOkqZLpQJh1uO2Q0YCTbYtUowBJU6ltEiWCBPkYpJZpEY4emfmR_2eFS5XQN68wihmgEoiMVEf8M3_gKBgwIBowD0AfULUJr9sL_rAkZCk114baNK4rY";

/**
 * A screen that shows a QR code to be scanned by the other device
 * in order to start the proximity flow.
 */
const ItwPrProximityQrCodeScreen = () => {
  const [qrCodeUri, setQrCodeUri] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  useOnFirstRender(() => {
    RNQRGenerator.generate({
      value: mockedQrCode,
      height: 300,
      width: 300,
      correctionLevel: "H"
    })
      .then(({ uri }) => {
        setQrCodeUri(uri);
        setIsLoading(true);
      })
      .catch(_ => {
        setIsError(true);
      });
  });

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
        {I18n.t("features.itWallet.presentation.qrCodeScreen.loading")}
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
    return <ErrorView />;
  }

  return (
    <BaseScreenComponent goBack={true}>
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
                {"Il tuo codice QR personale"}
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

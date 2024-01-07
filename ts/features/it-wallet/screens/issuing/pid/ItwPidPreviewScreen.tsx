import React from "react";
import { View } from "native-base";
import { SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import {
  Banner,
  Body,
  ButtonSolidProps,
  H2,
  IOStyles,
  VSpacer,
  useIOToast
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import I18n from "../../../../../i18n";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { ITW_ROUTES } from "../../../navigation/ItwRoutes";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../../store/hooks";
import ItwCredentialCard from "../../../components/ItwCredentialCard";
import { ForceScrollDownView } from "../../../../../components/ForceScrollDownView";
import ItwFooterVerticalButtons from "../../../components/ItwFooterVerticalButtons";
import { showCancelAlert } from "../../../utils/alert";
import ROUTES from "../../../../../navigation/routes";
import { CredentialType } from "../../../utils/mocks";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import ItwKoView from "../../../components/ItwKoView";
import {
  getItwGenericMappedError,
  ItWalletError
} from "../../../utils/itwErrorsUtils";
import ItwCredentialClaimsList from "../../../components/ItwCredentialClaimsList";
import { StoredCredential } from "../../../utils/types";
import { itwIssuancePidValueSelector } from "../../../store/reducers/issuance/pid/itwIssuancePidReducer";

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the PID.
 */
const ItwPidPreviewScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const pid = useIOSelector(itwIssuancePidValueSelector);
  const pidType = CredentialType.PID;

  /**
   * Renders the content of the screen if the PID is decoded.
   * @param decodedPid - the decoded PID
   */
  const ContentView = ({ pid }: { pid: StoredCredential }) => {
    const bannerViewRef = React.useRef(null);
    const toast = useIOToast();
    const alertOnPress = () => {
      toast.info(
        I18n.t("features.itWallet.issuing.credentialsChecksScreen.toast.cancel")
      );
      navigation.navigate(ROUTES.MAIN, { screen: ROUTES.MESSAGES_HOME });
    };

    const bottomButtonProps: ButtonSolidProps = {
      fullWidth: true,
      color: "contrast",
      label: I18n.t(
        "features.itWallet.issuing.pidPreviewScreen.buttons.cancel"
      ),
      accessibilityLabel: I18n.t(
        "features.itWallet.issuing.pidPreviewScreen.buttons.cancel"
      ),
      onPress: () => showCancelAlert(alertOnPress)
    };

    const topButtonProps: ButtonSolidProps = {
      color: "primary",
      fullWidth: true,
      accessibilityLabel: I18n.t(
        "features.itWallet.issuing.pidPreviewScreen.buttons.add"
      ),
      onPress: () => navigation.navigate(ITW_ROUTES.ISSUING.PID.ADDING),
      label: I18n.t("features.itWallet.issuing.pidPreviewScreen.buttons.add")
    };

    return (
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("features.itWallet.issuing.title")}
        contextualHelp={emptyContextualHelp}
      >
        <SafeAreaView style={IOStyles.flex}>
          <ForceScrollDownView>
            <VSpacer />
            <View style={IOStyles.horizontalContentPadding}>
              <H2>
                {I18n.t("features.itWallet.issuing.pidPreviewScreen.title")}
              </H2>
              <VSpacer size={16} />
              <Body>
                {I18n.t(
                  "features.itWallet.issuing.pidPreviewScreen.checkNotice"
                )}
              </Body>
              <VSpacer size={24} />
              <ItwCredentialCard
                parsedCredential={pid.parsedCredential}
                display={pid.displayData}
                type={pidType}
              />
              <VSpacer />
              <ItwCredentialClaimsList data={pid} />
              <VSpacer />
              <Banner
                color="neutral"
                pictogramName="security"
                title={I18n.t(
                  "features.itWallet.issuing.pidPreviewScreen.banner.title"
                )}
                size="big"
                content={I18n.t(
                  "features.itWallet.issuing.pidPreviewScreen.banner.content"
                )}
                action={I18n.t(
                  "features.itWallet.issuing.pidPreviewScreen.banner.actionTitle"
                )}
                onPress={() =>
                  navigation.navigate(ITW_ROUTES.GENERIC.NOT_AVAILABLE)
                }
                viewRef={bannerViewRef}
              />
              <VSpacer />
            </View>
            <ItwFooterVerticalButtons
              bottomButtonProps={bottomButtonProps}
              topButtonProps={topButtonProps}
            />
          </ForceScrollDownView>
        </SafeAreaView>
      </BaseScreenComponent>
    );
  };

  /**
   * Error view component which currently displays a generic error.
   * @param error - optional ItWalletError to be displayed.
   */
  const ErrorView = ({ error: _ }: { error?: ItWalletError }) => {
    const mappedError = getItwGenericMappedError(() => navigation.goBack());
    return <ItwKoView {...mappedError} />;
  };

  const RenderMask = () =>
    pipe(
      pid,
      O.fold(
        () => <ErrorView />,
        some => <ContentView pid={some} />
      )
    );

  return <RenderMask />;
};

export default ItwPidPreviewScreen;

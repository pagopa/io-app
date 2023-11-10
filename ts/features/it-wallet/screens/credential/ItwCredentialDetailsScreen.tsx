import React from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import {
  Banner,
  BlockButtonProps,
  FooterWithButtons,
  VSpacer
} from "@pagopa/io-app-design-system";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView, View } from "react-native";
import { constNull } from "fp-ts/lib/function";
import ItwCredentialCard from "../../components/ItwCredentialCard";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import ItwCredentialClaimsList from "../../components/ItwCredentialClaimsList";
import { StoredCredential } from "../../store/reducers/itwCredentialsReducer";

export type ItwCredentialDetailsScreenNavigationParams = {
  credential: StoredCredential;
};

type ItwCredentialDetailscreenRouteProps = RouteProp<
  ItwParamsList,
  "ITW_CREDENTIAL_DETAILS"
>;

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the credential.
 */
const ItwCredentialDetailsScreen = () => {
  const route = useRoute<ItwCredentialDetailscreenRouteProps>();
  const { credential } = route.params;
  const bannerViewRef = React.createRef<View>();

  /**
   * Content view which asks the user to confirm the issuance of the credential.
   * @param data - the issuance result data of the credential used to display the credential.
   */
  const ContentView = ({ data }: { data: StoredCredential }) => {
    const presentationButton: BlockButtonProps = {
      type: "Solid",
      buttonProps: {
        label: I18n.t(
          "features.itWallet.presentation.credentialDetails.buttons.qrCode"
        ),
        accessibilityLabel: I18n.t(
          "features.itWallet.presentation.credentialDetails.buttons.qrCode"
        ),
        onPress: () => null
      }
    };

    return (
      <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
        <SafeAreaView style={IOStyles.flex}>
          <ScrollView contentContainerStyle={IOStyles.horizontalContentPadding}>
            <ItwCredentialCard
              parsedCredential={data.parsedCredential}
              display={data.displayData}
            />
            <VSpacer />
            <ItwCredentialClaimsList data={{ ...data, issuerName: "INPS" }} />
            <VSpacer size={32} />
            <Banner
              testID={"ItwBannerTestID"}
              viewRef={bannerViewRef}
              color={"neutral"}
              size="big"
              title={I18n.t(
                "features.itWallet.issuing.credentialPreviewScreen.somethingWrong.title"
              )}
              content={I18n.t(
                "features.itWallet.issuing.credentialPreviewScreen.somethingWrong.subtitle",
                {
                  issuer: credential.parsedCredential
                }
              )}
              pictogramName={"security"}
              action={I18n.t(
                "features.itWallet.issuing.credentialPreviewScreen.somethingWrong.action"
              )}
              onPress={constNull}
            />
            <VSpacer size={32} />
          </ScrollView>
          <FooterWithButtons
            type={"SingleButton"}
            primary={presentationButton}
          />
        </SafeAreaView>
      </BaseScreenComponent>
    );
  };

  return <ContentView data={credential} />;
};

export default ItwCredentialDetailsScreen;

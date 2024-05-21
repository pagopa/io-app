import {
  ButtonLink,
  ButtonSolid,
  ContentWrapper,
  IOColors,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { StyleSheet, View } from "react-native";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ItwCredentialsMocks } from "../../__mocks__/credentials";
import { EidCardPreview } from "../../common/components/EidCardPreview";
import { ItwCredentialClaimsList } from "../../common/components/ItwCredentialClaimList";
import {
  ItWalletError,
  getItwGenericMappedError
} from "../../common/utils/itwErrorsUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

export const ItwIssuanceEidPreviewScreen = () => {
  const navigation = useIONavigation();
  const eidOption = O.some(ItwCredentialsMocks.eid);

  /**
   * Renders the content of the screen if the PID is decoded.
   * @param eid - the decoded eID
   */
  const ContentView = ({ eid }: { eid: StoredCredential }) => {
    React.useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: true
      });
    }, []);

    return (
      <IOScrollViewWithLargeHeader
        title={{
          label: I18n.t("features.itWallet.issuance.credentialPreview.title", {
            credential: eid.displayData.title
          })
        }}
      >
        <View style={styles.preview}>
          <EidCardPreview />
        </View>
        <View style={styles.dropShadow}>
          <VSpacer size={24} />
        </View>
        <View style={styles.content}>
          <ItwCredentialClaimsList data={eid} />
        </View>
        <ContentWrapper>
          <VSpacer size={32} />
          <ButtonSolid
            label={I18n.t(
              "features.itWallet.issuance.credentialPreview.actions.primary"
            )}
            icon="add"
            iconPosition="end"
            onPress={() => undefined}
            fullWidth={true}
          />
          <VSpacer size={24} />
          <View style={{ alignSelf: "center" }}>
            <ButtonLink
              label={I18n.t(
                "features.itWallet.issuance.credentialPreview.actions.secondary"
              )}
              onPress={() => undefined}
            />
          </View>
        </ContentWrapper>
      </IOScrollViewWithLargeHeader>
    );
  };

  /**
   * Error view component which currently displays a generic error.
   * @param error - optional ItWalletError to be displayed.
   */
  const ErrorView = ({ error: _ }: { error?: ItWalletError }) => {
    const mappedError = getItwGenericMappedError(() => navigation.goBack());
    return <OperationResultScreenContent {...mappedError} />;
  };

  return pipe(
    eidOption,
    O.fold(
      () => <ErrorView />,
      eid => <ContentView eid={eid} />
    )
  );
};

const styles = StyleSheet.create({
  preview: {
    paddingHorizontal: 24
  },
  dropShadow: {
    backgroundColor: IOColors.white,
    shadowColor: IOColors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 20,
    shadowOpacity: 0.2,
    elevation: 5
  },
  content: {
    flex: 1,
    backgroundColor: IOColors.white, // Add background to cover shadow
    paddingHorizontal: 24
  }
});

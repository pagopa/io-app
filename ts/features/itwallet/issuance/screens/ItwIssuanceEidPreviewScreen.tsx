import { IOColors, VSpacer, useIOTheme } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { ColorValue, StyleSheet, View } from "react-native";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { FooterActions } from "../../../../components/ui/FooterActions";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { identificationRequest } from "../../../../store/actions/identification";
import { useIODispatch } from "../../../../store/hooks";
import { ItwCredentialClaimsList } from "../../common/components/ItwCredentialClaimList";
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog";
import {
  ItWalletError,
  getItwGenericMappedError
} from "../../common/utils/itwErrorsUtils";
import {
  CredentialType,
  ItwCredentialsMocks
} from "../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { ITW_ROUTES } from "../../navigation/routes";
import { CredentialCard } from "../../common/components/CredentialCard";

export const ItwIssuanceEidPreviewScreen = () => {
  const navigation = useIONavigation();
  const eidOption = O.some(ItwCredentialsMocks.eid);

  /**
   * Renders the content of the screen if the PID is decoded.
   * @param eid - the decoded eID
   */
  const ContentView = ({ eid }: { eid: StoredCredential }) => {
    const theme = useIOTheme();
    const dispatch = useIODispatch();
    const dismissDialog = useItwDismissalDialog();

    const backgroundColor: ColorValue =
      IOColors[theme["appBackground-primary"]];

    React.useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: true
      });
    }, []);

    const handleSaveToWallet = () => {
      dispatch(
        identificationRequest(
          false,
          true,
          undefined,
          {
            label: I18n.t("global.buttons.cancel"),
            onCancel: () => undefined
          },
          {
            onSuccess: () =>
              navigation.navigate(ITW_ROUTES.MAIN, {
                screen: ITW_ROUTES.ISSUANCE.RESULT
              })
          }
        )
      );
    };

    return (
      <IOScrollViewWithLargeHeader
        excludeEndContentMargin
        title={{
          label: I18n.t("features.itWallet.issuance.credentialPreview.title", {
            credential: eid.displayData.title
          })
        }}
      >
        <View style={styles.preview}>
          <CredentialCard type={CredentialType.PID} isPreview={true} />
        </View>
        <View style={styles.dropShadow}>
          <VSpacer size={24} />
        </View>
        <View style={[styles.content, { backgroundColor }]}>
          <ItwCredentialClaimsList data={eid} />
        </View>
        <FooterActions
          fixed={false}
          actions={{
            type: "TwoButtons",
            primary: {
              icon: "add",
              iconPosition: "end",
              label: I18n.t(
                "features.itWallet.issuance.credentialPreview.actions.primary"
              ),
              onPress: handleSaveToWallet
            },
            secondary: {
              label: I18n.t(
                "features.itWallet.issuance.credentialPreview.actions.secondary"
              ),
              onPress: dismissDialog.show
            }
          }}
        />
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
    paddingHorizontal: 24
  }
});

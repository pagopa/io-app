import {
  ForceScrollDownView,
  H2,
  HeaderSecondLevel,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { StyleSheet, View } from "react-native";
import { FooterActions } from "../../../../components/ui/FooterActions";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { identificationRequest } from "../../../../store/actions/identification";
import { useIODispatch } from "../../../../store/hooks";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { ItwGenericErrorContent } from "../../common/components/ItwGenericErrorContent";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import {
  selectEidOption,
  selectIsDisplayingPreview
} from "../../machine/eid/selectors";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { ItwIssuanceLoadingScreen } from "../components/ItwIssuanceLoadingScreen";

export const ItwIssuanceEidPreviewScreen = () => {
  const eidOption = ItwEidIssuanceMachineContext.useSelector(selectEidOption);
  const isDisplayingPreview = ItwEidIssuanceMachineContext.useSelector(
    selectIsDisplayingPreview
  );

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  // In the state machine this screen is mounted before we actually reach the eID preview state.
  // While in the other states we render the loading screen to avoid accidentally showing the generic error content.
  if (!isDisplayingPreview) {
    return <ItwIssuanceLoadingScreen />;
  }

  return pipe(
    eidOption,
    O.fold(
      () => <ItwGenericErrorContent />,
      eid => <ContentView eid={eid} />
    )
  );
};

type ContentViewProps = {
  eid: StoredCredential;
};

/**
 * Renders the content of the screen if the PID is decoded.
 * @param eid - the decoded eID
 */
const ContentView = ({ eid }: ContentViewProps) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  useDebugInfo({
    parsedCredential: eid.parsedCredential
  });

  const dismissDialog = useItwDismissalDialog(() =>
    machineRef.send({ type: "close" })
  );

  const handleStoreEidSuccess = () => {
    machineRef.send({ type: "add-to-wallet" });
  };

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
          onSuccess: handleStoreEidSuccess
        }
      )
    );
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => (
        <HeaderSecondLevel
          title=""
          type="singleAction"
          firstAction={{
            icon: "closeLarge",
            onPress: dismissDialog.show,
            accessibilityLabel: I18n.t("global.buttons.close")
          }}
        />
      )
    });
  }, [navigation, dismissDialog]);

  return (
    <ForceScrollDownView contentContainerStyle={styles.scroll}>
      <View style={styles.contentWrapper}>
        <H2>{I18n.t("features.itWallet.issuance.eidPreview.title")}</H2>
        <VSpacer size={24} />
        <ItwCredentialPreviewClaimsList data={eid} />
        <VSpacer size={24} />
      </View>
      <FooterActions
        fixed={false}
        actions={{
          type: "TwoButtons",
          primary: {
            label: I18n.t(
              "features.itWallet.issuance.eidPreview.actions.primary"
            ),
            onPress: handleSaveToWallet
          },
          secondary: {
            label: I18n.t(
              "features.itWallet.issuance.eidPreview.actions.secondary"
            ),
            onPress: dismissDialog.show
          }
        }}
      />
    </ForceScrollDownView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1
  },
  contentWrapper: {
    flexGrow: 1,
    paddingHorizontal: IOVisualCostants.appMarginDefault
  }
});

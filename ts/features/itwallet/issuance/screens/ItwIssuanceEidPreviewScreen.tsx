import {
  ContentWrapper,
  ForceScrollDownView,
  H2,
  HeaderSecondLevel,
  HStack,
  Icon,
  useIOTheme,
  VStack
} from "@pagopa/io-app-design-system";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { useCallback, useLayoutEffect } from "react";
import IOMarkdown from "../../../../components/IOMarkdown";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { identificationRequest } from "../../../identification/store/actions";
import {
  trackCredentialPreview,
  trackItwExit,
  trackItwRequestSuccess,
  trackSaveCredentialToWallet
} from "../../analytics";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog";
import { isItwCredential } from "../../common/utils/itwCredentialUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import {
  isL3FeaturesEnabledSelector,
  selectEidOption,
  selectIdentification,
  selectLegacyCredentialsCount
} from "../../machine/eid/selectors";
import { ItwCredentialPreviewClaimsList } from "../components/ItwCredentialPreviewClaimsList";

export const ItwIssuanceEidPreviewScreen = () => {
  const eidOption = ItwEidIssuanceMachineContext.useSelector(selectEidOption);

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  return pipe(
    eidOption,
    O.fold(
      // If there is no eID in the context (None), we can safely assume the issuing phase is still ongoing.
      // A None eID cannot be stored in the context, as any issuance failure causes the machine to transition
      // to the Failure state.
      () => <LoadingScreenContent title={I18n.t("global.genericWaiting")} />,
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
  const identification =
    ItwEidIssuanceMachineContext.useSelector(selectIdentification);
  const isL3FeaturesEnabled = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );
  const legacyCredentialsCount = ItwEidIssuanceMachineContext.useSelector(
    selectLegacyCredentialsCount
  );
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const route = useRoute();

  const isL3 = isL3FeaturesEnabled && isItwCredential(eid);
  const mixPanelCredential = isL3 ? "ITW_PID" : "ITW_ID_V2";

  const theme = useIOTheme();

  useFocusEffect(
    useCallback(() => {
      trackCredentialPreview({
        credential: mixPanelCredential,
        credential_type: "unique"
      });
      if (identification) {
        trackItwRequestSuccess(
          identification?.mode,
          identification?.level,
          isL3 ? "L3" : "L2"
        );
      }
    }, [identification, mixPanelCredential, isL3])
  );

  useDebugInfo({
    parsedCredential: eid.parsedCredential
  });

  const dismissDialog = useItwDismissalDialog({
    handleDismiss: () => {
      machineRef.send({ type: "close" });
      trackItwExit({ exit_page: route.name, credential: mixPanelCredential });
    }
  });

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
            machineRef.send({
              type:
                legacyCredentialsCount > 0
                  ? "upgrade-credentials"
                  : "add-to-wallet"
            })
        }
      )
    );
  };

  useLayoutEffect(() => {
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
    <ForceScrollDownView
      contentContainerStyle={{ flexGrow: 1 }}
      footerActions={{
        actions: {
          type: "TwoButtons",
          primary: {
            label: I18n.t(
              "features.itWallet.issuance.eidPreview.actions.primary"
            ),
            onPress: () => {
              trackSaveCredentialToWallet(mixPanelCredential);
              handleSaveToWallet();
            }
          },
          secondary: {
            label: I18n.t(
              "features.itWallet.issuance.eidPreview.actions.secondary"
            ),
            onPress: dismissDialog.show
          }
        }
      }}
    >
      <ContentWrapper style={{ flexGrow: 1 }}>
        <VStack space={24}>
          <HStack space={8} style={{ alignItems: "center" }}>
            {!isL3 && (
              <Icon
                name="legalValue"
                color={theme["interactiveElem-default"]}
              />
            )}
            <H2>
              {I18n.t(
                `features.itWallet.issuance.eidPreview.${
                  isL3 ? "titleL3" : "title"
                }`
              )}
            </H2>
          </HStack>
          <IOMarkdown
            content={I18n.t(
              `features.itWallet.issuance.eidPreview.${
                isL3 ? "subtitleL3" : "subtitle"
              }`
            )}
          />
          <ItwCredentialPreviewClaimsList data={eid} releaserVisible={false} />
        </VStack>
      </ContentWrapper>
    </ForceScrollDownView>
  );
};

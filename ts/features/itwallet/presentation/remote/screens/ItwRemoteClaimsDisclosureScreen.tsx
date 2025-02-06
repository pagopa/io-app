import {
  Avatar,
  Body,
  ContentWrapper,
  FeatureInfo,
  ForceScrollDownView,
  HSpacer,
  Icon,
  IOStyles,
  ListItemHeader,
  VSpacer
} from "@pagopa/io-app-design-system";
import { View, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import I18n from "../../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList.ts";
import { ItwRemoteRequestPayload } from "../Utils/itwRemoteTypeUtils.ts";
import { ItwRemoteParamsList } from "../navigation/ItwRemoteParamsList.ts";
import { selectIsLoading } from "../machine/selectors.ts";
import { ItwRemoteMachineContext } from "../machine/provider.tsx";
import { useAvoidHardwareBackButton } from "../../../../../utils/useAvoidHardwareBackButton.ts";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation.ts";
import { usePreventScreenCapture } from "../../../../../utils/hooks/usePreventScreenCapture.ts";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent.tsx";
import { useItwDismissalDialog } from "../../../common/hooks/useItwDismissalDialog.tsx";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel.tsx";

export type ItwRemoteClaimsDisclosureScreenNavigationParams = {
  itwRemoteRequestPayload: ItwRemoteRequestPayload;
};

type ScreenProps = IOStackNavigationRouteProps<
  ItwRemoteParamsList,
  "ITW_REMOTE_CLAIMS_DISCLOSURE"
>;

const QRCodeValidationScreen = () => (
  <LoadingScreenContent
    contentTitle={I18n.t(
      "features.itWallet.presentation.remote.loadingScreen.title"
    )}
  >
    <View style={[IOStyles.alignCenter, IOStyles.horizontalContentPadding]}>
      <Body>
        {I18n.t("features.itWallet.presentation.remote.loadingScreen.subtitle")}
      </Body>
    </View>
  </LoadingScreenContent>
);

const ItwRemoteClaimsDisclosureScreen = (params: ScreenProps) => {
  usePreventScreenCapture();
  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  const machineRef = ItwRemoteMachineContext.useActorRef();

  const isMachineLoading = ItwRemoteMachineContext.useSelector(selectIsLoading);

  const itwRemoteRequestPayload = params.route.params.itwRemoteRequestPayload;

  useFocusEffect(
    useCallback(() => {
      if (itwRemoteRequestPayload) {
        machineRef.send({
          type: "start",
          payload: itwRemoteRequestPayload
        });
      }
    }, [itwRemoteRequestPayload, machineRef])
  );

  const dismissDialog = useItwDismissalDialog(() => {
    machineRef.send({ type: "close" });
  });

  useHeaderSecondLevel({ title: "", goBack: dismissDialog.show });

  if (isMachineLoading) {
    return <QRCodeValidationScreen />;
  }

  return (
    <ForceScrollDownView>
      <ContentWrapper>
        <VSpacer size={24} />
        <View style={styles.header}>
          <Avatar
            size="small"
            logoUri={require("../../../../../../img/features/itWallet/issuer/IPZS.png")}
          />
          <HSpacer size={8} />
          <Icon name={"transactions"} color={"grey-450"} size={24} />
          <HSpacer size={8} />
          <Avatar
            size="small"
            logoUri={require("../../../../../../img/app/app-logo-inverted.png")}
          />
        </View>
        <VSpacer size={24} />
        <VSpacer size={8} />
        <ListItemHeader
          label={I18n.t(
            "features.itWallet.issuance.credentialAuth.requiredClaims"
          )}
          iconName="security"
          iconColor="grey-700"
        />
        <VSpacer size={24} />
        <FeatureInfo
          iconName="fornitori"
          body={I18n.t(
            "features.itWallet.issuance.credentialAuth.disclaimer.0"
          )}
        />
        <VSpacer size={24} />
        <FeatureInfo
          iconName="trashcan"
          body={I18n.t(
            "features.itWallet.issuance.credentialAuth.disclaimer.1"
          )}
        />
      </ContentWrapper>
    </ForceScrollDownView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center"
  }
});

export { ItwRemoteClaimsDisclosureScreen };

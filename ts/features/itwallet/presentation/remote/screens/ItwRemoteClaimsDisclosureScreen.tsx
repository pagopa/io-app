import {
  Avatar,
  ContentWrapper,
  FeatureInfo,
  ForceScrollDownView,
  HSpacer,
  Icon,
  ListItemHeader,
  VSpacer
} from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import I18n from "../../../../../i18n";
import { usePreventScreenCapture } from "../../../../../utils/hooks/usePreventScreenCapture.ts";
import { useAvoidHardwareBackButton } from "../../../../../utils/useAvoidHardwareBackButton.ts";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation.ts";

const ItwRemoteClaimsDisclosureScreen = () => {
  usePreventScreenCapture();
  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

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

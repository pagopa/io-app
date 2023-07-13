import React from "react";
import { View } from "native-base";
import { SafeAreaView } from "react-native";
import PidCredential from "../../components/PidCredential";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { FeatureInfo } from "../../../../components/FeatureInfo";
import ScreenContent from "../../../../components/screens/ScreenContent";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { getPidMock } from "../../utils/mocks";
import ClaimsList from "../../components/ClaimsList";
import { useItwAbortFlow } from "../../hooks/useItwAbortSignatureFlow";

const VcPreviewScreen = () => {
  const spacerSize = 32;
  const pidMock = getPidMock();
  const { present, bottomSheet } = useItwAbortFlow();

  const cancelButtonProps = {
    block: true,
    bordered: true,
    onPress: present,
    title: I18n.t("features.itWallet.vcPreviewScreen.buttons.notNow")
  };
  const saveButtonProps = {
    block: true,
    primary: true,
    onPress: () => null,
    title: I18n.t("features.itWallet.vcPreviewScreen.buttons.add")
  };

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("features.itWallet.title")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={{ ...IOStyles.flex }}>
        <ScreenContent
          title={I18n.t("features.itWallet.vcPreviewScreen.title")}
        >
          <VSpacer />
          <View style={IOStyles.horizontalContentPadding}>
            <PidCredential
              name={`${pidMock.verified_claims.claims.given_name} ${pidMock.verified_claims.claims.family_name}`}
              fiscalCode={pidMock.verified_claims.claims.tax_id_number}
            />
            <VSpacer />
            <FeatureInfo
              body={I18n.t("features.itWallet.vcPreviewScreen.checkNotice")}
              iconName="notice"
            />
            <VSpacer />
            <ClaimsList claims={pidMock} />
            <VSpacer size={spacerSize} />
          </View>
        </ScreenContent>

        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={cancelButtonProps}
          rightButton={saveButtonProps}
        />
        {bottomSheet}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default VcPreviewScreen;

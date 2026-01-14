import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import I18n from "i18next";
import { ComponentProps } from "react";
import { IOScrollViewCentredContent } from "../../../../components/ui/IOScrollViewCentredContent";
import { useHeaderProps } from "../../../../hooks/useHeaderProps";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";

export const ItwIssuanceUpgradeCredentialsScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const navigation = useNavigation();

  const headerProps: ComponentProps<typeof HeaderSecondLevel> = {
    ignoreSafeAreaMargin: false,
    ignoreAccessibilityCheck: false,
    ...useHeaderProps({
      title: I18n.t(`features.itWallet.identification.updateCredential.title`),
      backAccessibilityLabel: I18n.t("global.buttons.back"),
      goBack: navigation.goBack,
      showHelp: true
    })
  };

  return (
    <IOScrollViewCentredContent
      pictogram={"premiumCredentials"}
      title={I18n.t(`features.itWallet.identification.updateCredential.title`)}
      description={I18n.t(
        `features.itWallet.identification.updateCredential.description`
      )}
      headerConfig={headerProps}
      actions={{
        type: "SingleButton",
        primary: {
          color: "primary",
          label: I18n.t(
            `features.itWallet.identification.updateCredential.button`
          ),
          onPress: () => machineRef.send({ type: "next" })
        }
      }}
    />
  );
};

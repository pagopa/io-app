import { IOColors, VSpacer, useIOTheme } from "@pagopa/io-app-design-system";
import React from "react";
import { ColorValue, StyleSheet, View } from "react-native";
import { FooterActions } from "../../../../components/ui/FooterActions";
import I18n from "../../../../i18n";
import { identificationRequest } from "../../../../store/actions/identification";
import { useIODispatch } from "../../../../store/hooks";
import { ItwCredentialClaimsList } from "../../common/components/ItwCredentialClaimList";
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { ItwCredentialCard } from "../../common/components/ItwCredentialCard";
import { CredentialType } from "../../common/utils/itwMocksUtils";

type Props = {
  data: StoredCredential;
  onStoreSuccess: () => void;
};

export const ItwCredentialPreviewScreenContent = ({
  data,
  onStoreSuccess
}: Props) => {
  const theme = useIOTheme();
  const dispatch = useIODispatch();
  const dismissDialog = useItwDismissalDialog();

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
          onSuccess: onStoreSuccess
        }
      )
    );
  };

  const backgroundColor: ColorValue = IOColors[theme["appBackground-primary"]];

  return (
    <>
      <View style={styles.preview}>
        <ItwCredentialCard
          credentialType={data.credentialType as CredentialType}
          isPreview={true}
        />
      </View>
      <View style={styles.dropShadow}>
        <VSpacer size={24} />
      </View>
      <View style={[styles.content, { backgroundColor }]}>
        <ItwCredentialClaimsList data={data} isPreview={true} />
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
    </>
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

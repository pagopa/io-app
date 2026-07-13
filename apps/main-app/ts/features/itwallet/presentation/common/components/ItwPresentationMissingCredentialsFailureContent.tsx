import { Body, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";

import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../../components/screens/OperationResultScreenContent.tsx";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet.tsx";
import { ITW_ROUTES } from "../../../navigation/routes.ts";

type Props = {
  credentialTypes: ReadonlyArray<string>;
  onClose: () => void;
};

export const ItwPresentationMissingCredentialsFailureContent = ({
  credentialTypes,
  onClose
}: Props) => {
  const navigation = useIONavigation();

  const { bottomSheet, present } = useIOBottomSheetModal({
    component: (
      <>
        <Body>
          {I18n.t(
            "features.itWallet.presentation.missingCredentials.other.bottomSheet.subtitle"
          )}
        </Body>
        <VSpacer size={24} />
      </>
    ),
    title: I18n.t(
      "features.itWallet.presentation.missingCredentials.other.bottomSheet.title"
    )
  });

  const getOperationResultScreenContentProps =
    (): OperationResultScreenContentProps => {
      if (credentialTypes.length === 1) {
        return {
          pictogram: "umbrella",
          title: I18n.t(
            "features.itWallet.presentation.missingCredentials.one.title"
          ),
          subtitle: I18n.t(
            "features.itWallet.presentation.missingCredentials.one.subtitle"
          ),
          action: {
            icon: "addSmall",
            iconPosition: "end",
            label: I18n.t(
              "features.itWallet.presentation.missingCredentials.one.primaryAction"
            ),
            onPress: () => {
              navigation.replace(ITW_ROUTES.MAIN, {
                screen: ITW_ROUTES.LANDING.CREDENTIAL_ISSUANCE,
                params: {
                  credentialType: credentialTypes[0]
                }
              });
            }
          },
          secondaryAction: {
            label: I18n.t(
              "features.itWallet.presentation.missingCredentials.one.secondaryAction"
            ),
            onPress: onClose
          }
        };
      }

      return {
        title: I18n.t(
          "features.itWallet.presentation.missingCredentials.other.title"
        ),
        subtitle: I18n.t(
          "features.itWallet.presentation.missingCredentials.other.subtitle"
        ),
        pictogram: "umbrella",
        action: {
          label: I18n.t(
            "features.itWallet.presentation.missingCredentials.other.primaryAction"
          ),
          onPress: () => {
            present();
          }
        },
        secondaryAction: {
          label: I18n.t(
            "features.itWallet.presentation.missingCredentials.other.secondaryAction"
          ),
          onPress: onClose
        }
      };
    };

  return (
    <>
      <OperationResultScreenContent
        {...getOperationResultScreenContentProps()}
      />
      {bottomSheet}
    </>
  );
};

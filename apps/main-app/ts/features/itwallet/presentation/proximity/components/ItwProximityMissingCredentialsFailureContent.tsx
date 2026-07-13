import { Body, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";

import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../../components/screens/OperationResultScreenContent.tsx";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet.tsx";
import { ITW_ROUTES } from "../../../navigation/routes.ts";
import { ItwProximityMachineContext } from "../machine/provider.tsx";

type Props = {
  credentialTypes: ReadonlyArray<string>;
};

export const ItwProximityMissingCredentialsFailureContent = ({
  credentialTypes
}: Props) => {
  const navigation = useIONavigation();
  const machineRef = ItwProximityMachineContext.useActorRef();

  const { bottomSheet, present } = useIOBottomSheetModal({
    component: (
      <>
        <Body>
          {I18n.t(
            "features.itWallet.presentation.proximity.relyingParty.missingCredentials.other.bottomSheet.subtitle"
          )}
        </Body>
        <VSpacer size={24} />
      </>
    ),
    title: I18n.t(
      "features.itWallet.presentation.proximity.relyingParty.missingCredentials.other.bottomSheet.title"
    )
  });

  const getOperationResultScreenContentProps =
    (): OperationResultScreenContentProps => {
      if (credentialTypes.length > 1) {
        return {
          title: I18n.t(
            "features.itWallet.presentation.proximity.relyingParty.missingCredentials.other.title"
          ),
          subtitle: I18n.t(
            "features.itWallet.presentation.proximity.relyingParty.missingCredentials.other.subtitle"
          ),
          pictogram: "umbrella",
          action: {
            label: I18n.t(
              "features.itWallet.presentation.proximity.relyingParty.missingCredentials.other.primaryAction"
            ),
            onPress: () => {
              present();
            }
          },
          secondaryAction: {
            label: I18n.t(
              "features.itWallet.presentation.proximity.relyingParty.missingCredentials.other.secondaryAction"
            ),
            onPress: () => {
              machineRef.send({ type: "close" });
            }
          }
        };
      }

      return {
        pictogram: "umbrella",
        title: I18n.t(
          "features.itWallet.presentation.proximity.relyingParty.missingCredentials.one.title"
        ),
        subtitle: I18n.t(
          "features.itWallet.presentation.proximity.relyingParty.missingCredentials.one.subtitle"
        ),
        action: {
          icon: "addSmall",
          iconPosition: "end",
          label: I18n.t(
            "features.itWallet.presentation.proximity.relyingParty.missingCredentials.one.primaryAction"
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
            "features.itWallet.presentation.proximity.relyingParty.missingCredentials.one.secondaryAction"
          ),
          onPress: () => {
            machineRef.send({ type: "close" });
          }
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

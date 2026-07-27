import {
  Body,
  Divider,
  IOButton,
  ListItemInfo,
  VSpacer
} from "@io-app/design-system";
import I18n from "i18next";

import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../../components/screens/OperationResultScreenContent.tsx";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet.tsx";
import {
  itwCredentialNameResolverSelector,
  itwCredentialTypeFromDocTypeSelector
} from "../../../credentialsCatalogue/store/selectors/index.ts";
import { ITW_ROUTES } from "../../../navigation/routes.ts";

type Props = {
  credentialDocTypes: ReadonlyArray<string>;
  onClose: () => void;
};

export const ItwPresentationMissingCredentialsFailureContent = ({
  credentialDocTypes,
  onClose
}: Props) => {
  const navigation = useIONavigation();
  const getCredentialTypeFromDocType = useIOSelector(
    itwCredentialTypeFromDocTypeSelector
  );
  const resolveCredentialName = useIOSelector(
    itwCredentialNameResolverSelector
  );

  const { bottomSheet, present, dismiss } = useIOBottomSheetModal({
    title: I18n.t(
      "features.itWallet.presentation.missingCredentials.other.bottomSheet.title"
    ),
    component: (
      <>
        <Body>
          {I18n.t(
            "features.itWallet.presentation.missingCredentials.other.bottomSheet.subtitle"
          )}
        </Body>
        <VSpacer size={24} />
        {credentialDocTypes.map((docType, index) => {
          const credentialType = getCredentialTypeFromDocType(docType);
          const credentialName = resolveCredentialName(credentialType);

          return (
            <>
              {index !== 0 && <Divider />}
              <ListItemInfo
                icon="fiscalCodeIndividual"
                key={docType}
                value={credentialName}
              />
            </>
          );
        })}
        <VSpacer size={32} />
        <IOButton
          icon="addSmall"
          iconPosition="end"
          label={I18n.t(
            "features.itWallet.presentation.missingCredentials.other.bottomSheet.primaryAction"
          )}
          onPress={() => {
            dismiss();
            navigation.replace(ITW_ROUTES.MAIN, {
              screen: ITW_ROUTES.L3_ONBOARDING
            });
          }}
        />
      </>
    )
  });

  const getOperationResultScreenContentProps =
    (): OperationResultScreenContentProps => {
      if (credentialDocTypes.length === 1) {
        const credentialType = getCredentialTypeFromDocType(
          credentialDocTypes[0]
        );
        const credentialName = resolveCredentialName(credentialType);

        return {
          pictogram: "umbrella",
          title: I18n.t(
            "features.itWallet.presentation.missingCredentials.one.title"
          ),
          subtitle: I18n.t(
            "features.itWallet.presentation.missingCredentials.one.subtitle",
            {
              credentialName
            }
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
                  credentialType: credentialType || ""
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

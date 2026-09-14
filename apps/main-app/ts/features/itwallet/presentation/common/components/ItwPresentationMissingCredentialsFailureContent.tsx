import {
  Body,
  Divider,
  IOButton,
  ListItemInfo,
  VSpacer
} from "@io-app/design-system";
import I18n from "i18next";
import { Fragment } from "react";

import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../../components/screens/OperationResultScreenContent.tsx";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet.tsx";
import { itwCredentialNameResolverSelector } from "../../../credentialsCatalogue/store/selectors/index.ts";
import { ITW_ROUTES } from "../../../navigation/routes.ts";

type Props = {
  /** The list of missing credentials types to display */
  missingCredentials: ReadonlyArray<string>;
  /** Callback to be called when the user closes the screen */
  onClose: () => void;
};

export const ItwPresentationMissingCredentialsFailureContent = ({
  missingCredentials,
  onClose
}: Props) => {
  const navigation = useIONavigation();
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
        {missingCredentials.map((type, index) => {
          const credentialName = resolveCredentialName(type);
          return (
            <Fragment key={type}>
              {index !== 0 && <Divider />}
              <ListItemInfo
                icon="fiscalCodeIndividual"
                value={credentialName}
              />
            </Fragment>
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
      if (missingCredentials.length === 1) {
        const credentialName = resolveCredentialName(missingCredentials[0]);

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
                  credentialType: missingCredentials[0]
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

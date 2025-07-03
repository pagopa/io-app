import { memo, Fragment, useEffect } from "react";
import { View } from "react-native";
import {
  Body,
  Divider,
  H4,
  IOButton,
  ListItemHeader,
  VStack
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { constNull, pipe } from "fp-ts/lib/function";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import {
  itwCredentialsEidSelector,
  itwCredentialsEidStatusSelector
} from "../../credentials/store/selectors";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { parseClaims, WellKnownClaim } from "../utils/itwClaimsUtils";
import { ITW_ROUTES } from "../../navigation/routes";
import { StoredCredential } from "../utils/itwTypesUtils";
import {
  CREDENTIALS_MAP,
  mapEidStatusToMixpanel,
  trackCredentialDetail,
  trackWalletStartDeactivation
} from "../../analytics";
import { ItwCredentialClaim } from "./ItwCredentialClaim";
import { ItwEidLifecycleAlert } from "./ItwEidLifecycleAlert";

type ItwEidInfoBottomSheetContentProps = {
  navigation: ReturnType<typeof useIONavigation>;
};

/**
 * This component displays detailed information about the citizen's `PID`,
 * the credential's validity status, and allows the citizen to deactivate the IT-Wallet.
 *
 * @note This variant is used in the case of IT-Wallet activation.
 *       Otherwise, refer to `ItwEidInfoBottomSheetContent`.
 */
const ItwEidDetail = ({ navigation }: ItwEidInfoBottomSheetContentProps) => {
  const eidOption = useIOSelector(itwCredentialsEidSelector);
  const eidStatus = useIOSelector(itwCredentialsEidStatusSelector);

  const Content = ({ credential }: { credential: StoredCredential }) => {
    const claims = parseClaims(credential.parsedCredential, {
      exclude: [WellKnownClaim.unique_id, WellKnownClaim.content]
    });

    const navigateToWalletRevocationScreen = () => {
      trackWalletStartDeactivation();
      navigation.navigate(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.WALLET_REVOCATION_SCREEN
      });
    };

    useEffect(() => {
      if (eidStatus) {
        trackCredentialDetail({
          credential: CREDENTIALS_MAP[credential.credentialType],
          credential_status: mapEidStatusToMixpanel(eidStatus)
        });
      }
    }, [credential.credentialType]);

    return (
      <VStack space={24}>
        <H4>{I18n.t("features.itWallet.eidDetail.title")}</H4>
        <Body>{I18n.t("features.itWallet.eidDetail.content")}</Body>
        <ListItemHeader
          iconName="security"
          label={I18n.t("features.itWallet.eidDetail.header.title")}
        />
        <View>
          {claims.map((claim, index) => (
            <Fragment key={index}>
              {index !== 0 && <Divider />}
              <ItwCredentialClaim claim={claim} isPreview={true} />
            </Fragment>
          ))}
        </View>
        <ItwEidLifecycleAlert navigation={navigation} />
        <IOButton
          fullWidth
          variant="solid"
          color="danger"
          label={I18n.t("features.itWallet.eidDetail.cta")}
          onPress={navigateToWalletRevocationScreen}
        />
      </VStack>
    );
  };

  return pipe(
    eidOption,
    O.fold(
      constNull, // This should never happen
      credential => <Content credential={credential} />
    )
  );
};

const MemoizedItwEidDetail = memo(ItwEidDetail);

export { MemoizedItwEidDetail as ItwEidDetail };

import {
  Divider,
  H4,
  HStack,
  Icon,
  IOButton,
  VStack
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { constNull, pipe } from "fp-ts/lib/function";
import { Fragment, memo, useEffect } from "react";
import { View } from "react-native";
import IOMarkdown from "../../../../components/IOMarkdown";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import {
  CREDENTIALS_MAP,
  mapPIDStatusToMixpanel,
  trackCredentialDetail,
  trackWalletStartDeactivation
} from "../../analytics";
import {
  itwCredentialsEidSelector,
  itwCredentialsEidStatusSelector
} from "../../credentials/store/selectors";
import { ITW_ROUTES } from "../../navigation/routes";
import { useItwStatusIconColor } from "../hooks/useItwStatusIconColor";
import { parseClaims, WellKnownClaim } from "../utils/itwClaimsUtils";
import { StoredCredential } from "../utils/itwTypesUtils";
import { ItwCredentialClaim } from "./ItwCredentialClaim";
import { ItwEidLifecycleAlert } from "./ItwEidLifecycleAlert";

type ItwEidInfoBottomSheetTitleProps = {
  isExpired: boolean;
};

export const ItwEidInfoBottomSheetTitle = ({
  isExpired
}: ItwEidInfoBottomSheetTitleProps) => {
  const iconColor = useItwStatusIconColor(isExpired);

  return (
    <HStack space={8} style={{ alignItems: "center" }}>
      <Icon name="legalValue" color={iconColor} />
      <H4>
        {I18n.t(
          isExpired
            ? "features.itWallet.presentation.bottomSheets.eidInfo.titleExpired"
            : "features.itWallet.presentation.bottomSheets.eidInfo.title"
        )}
      </H4>
    </HStack>
  );
};

type ItwEidInfoBottomSheetContentProps = {
  navigation: ReturnType<typeof useIONavigation>;
};

const ItwEidInfoBottomSheetContent = ({
  navigation
}: ItwEidInfoBottomSheetContentProps) => {
  const eidOption = useIOSelector(itwCredentialsEidSelector);
  const eidStatus = useIOSelector(itwCredentialsEidStatusSelector);

  const Content = ({ credential }: { credential: StoredCredential }) => {
    const claims = parseClaims(credential.parsedCredential, {
      exclude: [WellKnownClaim.unique_id, WellKnownClaim.content]
    });

    const navigateToWalletRevocationScreen = () => {
      trackWalletStartDeactivation("ITW_ID_V2");
      navigation.navigate(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.WALLET_REVOCATION_SCREEN
      });
    };

    useEffect(() => {
      if (eidStatus) {
        trackCredentialDetail({
          credential: CREDENTIALS_MAP[credential.credentialType],
          credential_status: mapPIDStatusToMixpanel(eidStatus)
        });
      }
    }, [credential.credentialType]);

    return (
      <VStack space={24}>
        <IOMarkdown
          content={I18n.t(
            "features.itWallet.presentation.bottomSheets.eidInfo.contentTop"
          )}
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
        <IOMarkdown
          content={I18n.t(
            "features.itWallet.presentation.bottomSheets.eidInfo.contentBottom"
          )}
        />
        <IOButton
          fullWidth
          variant="solid"
          color="danger"
          label={I18n.t("features.itWallet.walletRevocation.cta")}
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

const MemoizedItwEidInfoBottomSheetContent = memo(ItwEidInfoBottomSheetContent);

export { MemoizedItwEidInfoBottomSheetContent as ItwEidInfoBottomSheetContent };

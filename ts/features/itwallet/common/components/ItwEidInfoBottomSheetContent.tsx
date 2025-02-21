import { memo, Fragment, useEffect } from "react";
import { View } from "react-native";
import {
  ButtonSolid,
  Divider,
  H4,
  HStack,
  Icon,
  IOStyles,
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
import IOMarkdown from "../../../../components/IOMarkdown";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { parseClaims, WellKnownClaim } from "../utils/itwClaimsUtils";
import { ITW_ROUTES } from "../../navigation/routes";
import { StoredCredential } from "../utils/itwTypesUtils";
import {
  CREDENTIALS_MAP,
  ID_STATUS_MAP,
  trackCredentialDetail,
  trackWalletStartDeactivation
} from "../../analytics";
import { ItwCredentialClaim } from "./ItwCredentialClaim";
import { ItwEidLifecycleAlert } from "./ItwEidLifecycleAlert";

type ItwEidInfoBottomSheetTitleProps = {
  isExpired: boolean;
};

export const ItwEidInfoBottomSheetTitle = ({
  isExpired
}: ItwEidInfoBottomSheetTitleProps) => (
  <HStack space={8} style={IOStyles.alignCenter}>
    <Icon name="legalValue" color={isExpired ? "grey-300" : "blueIO-500"} />
    <H4>
      {I18n.t(
        isExpired
          ? "features.itWallet.presentation.bottomSheets.eidInfo.titleExpired"
          : "features.itWallet.presentation.bottomSheets.eidInfo.title"
      )}
    </H4>
  </HStack>
);

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
      trackWalletStartDeactivation();
      navigation.navigate(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.WALLET_REVOCATION_SCREEN
      });
    };

    useEffect(() => {
      if (eidStatus) {
        trackCredentialDetail({
          credential: CREDENTIALS_MAP[credential.credentialType],
          credential_status: ID_STATUS_MAP[eidStatus]
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
        <ButtonSolid
          label={I18n.t("features.itWallet.walletRevocation.cta")}
          fullWidth
          color="danger"
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

import React from "react";
import { View } from "react-native";
import {
  Divider,
  HStack,
  Icon,
  IOStyles,
  VStack,
  H4,
  ButtonSolid
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { constNull, pipe } from "fp-ts/lib/function";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { itwCredentialsEidSelector } from "../../credentials/store/selectors";
import IOMarkdown from "../../../../components/IOMarkdown";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { parseClaims, WellKnownClaim } from "../utils/itwClaimsUtils";
import { ITW_ROUTES } from "../../navigation/routes";
import { StoredCredential } from "../utils/itwTypesUtils";
import { ItwCredentialClaim } from "./ItwCredentialClaim";
import { ItwEidLifecycleAlert } from "./ItwEidLifecycleAlert";

export const ItwEidInfoBottomSheetTitle = ({
  isExpired
}: {
  isExpired: boolean;
}) => (
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

type Props = {
  navigation: ReturnType<typeof useIONavigation>;
};

const ItwEidInfoBottomSheetContent = ({ navigation }: Props) => {
  const eidOption = useIOSelector(itwCredentialsEidSelector);

  const Content = ({ credential }: { credential: StoredCredential }) => {
    const claims = parseClaims(credential.parsedCredential, {
      exclude: [WellKnownClaim.unique_id, WellKnownClaim.content]
    });

    const navigateToWalletRevocationScreen = () =>
      navigation.navigate(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.WALLET_REVOCATION_SCREEN
      });

    return (
      <VStack space={24}>
        <IOMarkdown
          content={I18n.t(
            "features.itWallet.presentation.bottomSheets.eidInfo.contentTop"
          )}
        />
        <View>
          {claims.map((claim, index) => (
            <React.Fragment key={index}>
              {index !== 0 && <Divider />}
              <ItwCredentialClaim claim={claim} isPreview={true} />
            </React.Fragment>
          ))}
        </View>
        <ItwEidLifecycleAlert />
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

const MemoizedItwEidInfoBottomSheetContent = React.memo(
  ItwEidInfoBottomSheetContent
);

export { MemoizedItwEidInfoBottomSheetContent as ItwEidInfoBottomSheetContent };

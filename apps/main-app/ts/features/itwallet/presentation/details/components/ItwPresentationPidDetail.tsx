import {
  Divider,
  IOButton,
  IOMarkdownLite,
  ListItemHeader,
  ListItemInfo,
  VStack
} from "@io-app/design-system";
import { useRoute } from "@react-navigation/native";
import I18n from "i18next";
import { useMemo } from "react";
import { View } from "react-native";
import { Fragment } from "react/jsx-runtime";

import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { ItwCredentialClaim } from "../../../common/components/ItwCredentialClaim";
import { ItwEidLifecycleAlert } from "../../../common/components/ItwEidLifecycleAlert";
import { ItwIssuanceMetadata } from "../../../common/components/ItwIssuanceMetadata";
import { itwSetClaimValuesHidden } from "../../../common/store/actions/preferences";
import { itwIsClaimValueHiddenSelector } from "../../../common/store/selectors/preferences";
import {
  parseClaims,
  WellKnownClaim
} from "../../../common/utils/itwClaimsUtils";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";

type Props = {
  credential: CredentialMetadata;
};

export const ItwPresentationPidDetail = ({ credential }: Props) => {
  const claimsHidden = useIOSelector(itwIsClaimValueHiddenSelector);
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const { name: currentScreenName } = useRoute();
  const expirationDateInfo = useIOBottomSheetModal({
    title: I18n.t(
      "features.itWallet.presentation.itWalletId.expirationDateInfo.title"
    ),
    component: (
      <VStack space={24}>
        <IOMarkdownLite
          content={I18n.t(
            "features.itWallet.presentation.itWalletId.expirationDateInfo.content"
          )}
        />
        <IOButton
          fullWidth
          label={I18n.t(
            "features.itWallet.presentation.itWalletId.expirationDateInfo.primaryAction"
          )}
          onPress={() => expirationDateInfo.dismiss()}
          variant="solid"
        />
      </VStack>
    )
  });
  const expirationDateEndElement: ListItemInfo["endElement"] = {
    type: "iconButton",
    componentProps: {
      accessibilityLabel: I18n.t(
        "features.itWallet.presentation.itWalletId.expirationDateInfo.accessibilityLabel"
      ),
      icon: "info",
      onPress: expirationDateInfo.present
    }
  };

  const listItemHeaderLabel = I18n.t(
    "features.itWallet.presentation.itWalletId.listItemHeader"
  );
  const toggleValuesAccessibilityLabel = I18n.t(
    claimsHidden
      ? "features.itWallet.presentation.itWalletId.listItemHeaderShowValues"
      : "features.itWallet.presentation.itWalletId.listItemHeaderHideValues"
  );
  const claims = useMemo(
    () =>
      parseClaims(credential.parsedCredential, {
        exclude: [
          WellKnownClaim.unique_id,
          WellKnownClaim.content,
          WellKnownClaim.issuing_authority
        ]
      }),
    [credential.parsedCredential]
  );

  const endElement = useMemo<ListItemHeader["endElement"]>(
    () => ({
      type: "iconButton",
      componentProps: {
        icon: claimsHidden ? "eyeHide" : "eyeShow",
        accessibilityLabel: toggleValuesAccessibilityLabel,
        onPress: () => dispatch(itwSetClaimValuesHidden(!claimsHidden)),
        testID: "toggle-pid-claim-visibility"
      }
    }),
    [claimsHidden, dispatch, toggleValuesAccessibilityLabel]
  );

  return (
    <View>
      <ItwEidLifecycleAlert
        currentScreenName={currentScreenName}
        lifecycleStatus={["jwtExpiring", "jwtExpired", "invalid"]}
        navigation={navigation}
        skipViewTracking={false}
      />
      {claims.length > 0 && (
        <ListItemHeader endElement={endElement} label={listItemHeaderLabel} />
      )}
      {claims.map((claim, index) => (
        <Fragment key={claim.id}>
          {index !== 0 && <Divider />}
          <ItwCredentialClaim
            claim={claim}
            endElement={expirationDateEndElement}
            hidden={claimsHidden}
            isPreview
          />
        </Fragment>
      ))}
      {claims.length > 0 && <Divider />}
      <ItwIssuanceMetadata credential={credential} />
      {expirationDateInfo.bottomSheet}
    </View>
  );
};

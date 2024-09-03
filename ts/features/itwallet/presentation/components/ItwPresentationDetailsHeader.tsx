import React from "react";
import { View, StyleSheet } from "react-native";
import { IOVisualCostants } from "@pagopa/io-app-design-system";
import { ItwCredentialCard } from "../../common/components/ItwCredentialCard";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { getCredentialExpireStatus } from "../../common/utils/itwClaimsUtils";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { getThemeColorByCredentialType } from "../../common/utils/itwStyleUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";

type ItwPresentationDetailsHeaderProps = { credential: StoredCredential };

const ItwPresentationDetailsHeader = ({
  credential
}: ItwPresentationDetailsHeaderProps) => {
  const themeColor = getThemeColorByCredentialType(
    credential.credentialType as CredentialType
  );

  useHeaderSecondLevel({
    title: "Tessera sanitaria",
    supportRequest: true,
    variant: "contrast",
    backgroundColor: themeColor
  });

  const credentialStatus = getCredentialExpireStatus(
    credential.parsedCredential
  );

  return (
    <>
      <FocusAwareStatusBar
        backgroundColor={themeColor}
        barStyle="light-content"
      />
      <View style={styles.cardContainer}>
        <ItwCredentialCard
          credentialType={credential.credentialType}
          status={credentialStatus}
        />
        <View style={[styles.cardBackdrop, { backgroundColor: themeColor }]} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: "relative",
    paddingHorizontal: IOVisualCostants.appMarginDefault
  },
  cardBackdrop: {
    height: "200%", // Twice the card in order to avoid the white background when the scrollview bounces
    position: "absolute",
    top: "-130%", // Offset by the card height + a 30%
    right: 0,
    left: 0,
    zIndex: -1
  }
});

const MemoizedItwPresentationDetailsHeader = React.memo(
  ItwPresentationDetailsHeader
);

export { MemoizedItwPresentationDetailsHeader as ItwPresentationDetailsHeader };

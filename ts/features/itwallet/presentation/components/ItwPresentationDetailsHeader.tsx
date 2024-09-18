import {
  ContentWrapper,
  IOVisualCostants,
  makeFontStyleObject
} from "@pagopa/io-app-design-system";
import React from "react";
import { ImageSourcePropType, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedImage } from "../../../../components/AnimatedImage";
import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { getThemeColorByCredentialType } from "../../common/utils/itwStyleUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { ItwPresentationCredentialCard } from "./ItwPresentationCredentialCard";

type ItwPresentationDetailsHeaderProps = { credential: StoredCredential };

/**
 * Credentials that should display a card
 */
const credentialsWithCard: ReadonlyArray<string> = [
  CredentialType.PID,
  CredentialType.DRIVING_LICENSE,
  CredentialType.EUROPEAN_DISABILITY_CARD
];

/**
 * Images for the header
 */
const credentialsHeader: Record<string, ImageSourcePropType> = {
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: require("../../../../../img/features/itWallet/header/ts_header.png")
};

/**
 * This component renders the header for the presentation details screen of a credential
 * If the credential needs to show the card, it will render the card, otherwise it will render the header with the title
 */
const ItwPresentationDetailsHeader = ({
  credential
}: ItwPresentationDetailsHeaderProps) => {
  const safeAreaInsets = useSafeAreaInsets();

  const { backgroundColor, textColor, statusBarStyle } =
    getThemeColorByCredentialType(credential.credentialType as CredentialType);

  const headerHeight = safeAreaInsets.top + IOVisualCostants.headerHeight;

  const headerContent = React.useMemo(() => {
    if (credentialsWithCard.includes(credential.credentialType)) {
      return <ItwPresentationCredentialCard credential={credential} />;
    }

    return (
      <View
        style={{
          backgroundColor,
          marginTop: -(headerHeight + 300),
          paddingTop: headerHeight + 300,
          justifyContent: "flex-end",
          paddingBottom: 24
        }}
      >
        <AnimatedImage
          source={credentialsHeader[credential.credentialType]}
          style={styles.headerImage}
        />
        <ContentWrapper>
          <Text style={[styles.headerLabel, { color: textColor }]}>
            {getCredentialNameFromType(credential.credentialType)}
          </Text>
        </ContentWrapper>
      </View>
    );
  }, [credential, backgroundColor, textColor, headerHeight]);

  return (
    <View
      style={{
        paddingTop: headerHeight
      }}
    >
      <FocusAwareStatusBar
        backgroundColor={backgroundColor}
        barStyle={statusBarStyle}
      />
      {headerContent}
    </View>
  );
};

const styles = StyleSheet.create({
  headerImage: {
    width: "100%",
    position: "absolute"
  },
  headerLabel: {
    ...makeFontStyleObject(26, "ReadexPro", 30, "Semibold")
  }
});

const MemoizedItwPresentationDetailsHeader = React.memo(
  ItwPresentationDetailsHeader
);

export { MemoizedItwPresentationDetailsHeader as ItwPresentationDetailsHeader };

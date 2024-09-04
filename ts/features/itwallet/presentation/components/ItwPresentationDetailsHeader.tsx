import { ContentWrapper, H2 } from "@pagopa/io-app-design-system";
import React from "react";
import { ImageSourcePropType, View } from "react-native";
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

const ItwPresentationDetailsHeader = ({
  credential
}: ItwPresentationDetailsHeaderProps) => {
  const safeAreaInsets = useSafeAreaInsets();

  const { backgroundColor, statusBarStyle } = getThemeColorByCredentialType(
    credential.credentialType as CredentialType
  );

  const hasCard = credentialsWithCard.includes(credential.credentialType);
  const headerHeight = safeAreaInsets.top + 64;

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
      {hasCard ? (
        <ItwPresentationCredentialCard credential={credential} />
      ) : (
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
            style={{ width: "100%", position: "absolute" }}
          />
          <ContentWrapper>
            <H2 color="blueIO-850">
              {getCredentialNameFromType(credential.credentialType)}
            </H2>
          </ContentWrapper>
        </View>
      )}
    </View>
  );
};

const MemoizedItwPresentationDetailsHeader = React.memo(
  ItwPresentationDetailsHeader
);

export { MemoizedItwPresentationDetailsHeader as ItwPresentationDetailsHeader };

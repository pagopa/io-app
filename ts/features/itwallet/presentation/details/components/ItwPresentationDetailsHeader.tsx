import {
  ContentWrapper,
  makeFontStyleObject,
  useIOExperimentalDesign
} from "@pagopa/io-app-design-system";
import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import FocusAwareStatusBar from "../../../../../components/ui/FocusAwareStatusBar.tsx";
import { useItwFeaturesEnabled } from "../../../common/hooks/useItwFeaturesEnabled.ts";
import { getCredentialNameFromType } from "../../../common/utils/itwCredentialUtils.ts";
import { CredentialType } from "../../../common/utils/itwMocksUtils.ts";
import { useThemeColorByCredentialType } from "../../../common/utils/itwStyleUtils.ts";
import { StoredCredential } from "../../../common/utils/itwTypesUtils.ts";
import { ItwPresentationCredentialCard } from "./ItwPresentationCredentialCard.tsx";

type ItwPresentationDetailsHeaderProps = {
  credential: StoredCredential;
};

/**
 * Credentials that should display a skeumorphic card
 */
const credentialsWithSkeumorphicCard: ReadonlyArray<string> = [
  CredentialType.DRIVING_LICENSE,
  CredentialType.EUROPEAN_DISABILITY_CARD
];

/**
 * This component renders the header for the presentation details screen of a credential
 * If the credential needs to show the card, it will render the card, otherwise it will render the header with the title
 */
const ItwPresentationDetailsHeader = ({
  credential
}: ItwPresentationDetailsHeaderProps) => {
  const { isExperimental } = useIOExperimentalDesign();
  const itwFeaturesEnabled = useItwFeaturesEnabled(credential);

  const { backgroundColor, textColor, statusBarStyle } =
    useThemeColorByCredentialType(
      credential.credentialType as CredentialType,
      itwFeaturesEnabled
    );

  const headerContent = useMemo(() => {
    if (credentialsWithSkeumorphicCard.includes(credential.credentialType)) {
      return <ItwPresentationCredentialCard credential={credential} />;
    }

    return (
      <View style={[styles.header, { backgroundColor }]}>
        <ContentWrapper>
          <Text
            style={[
              isExperimental
                ? styles.headerLabelExperimental
                : styles.headerLabel,
              { color: textColor }
            ]}
            accessibilityRole="header"
          >
            {getCredentialNameFromType(credential.credentialType)}
          </Text>
        </ContentWrapper>
      </View>
    );
  }, [credential, backgroundColor, textColor, isExperimental]);

  return (
    <View>
      <FocusAwareStatusBar
        backgroundColor={backgroundColor}
        barStyle={statusBarStyle}
      />
      {headerContent}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: -300,
    paddingTop: 300,
    justifyContent: "flex-end",
    paddingBottom: 24
  },
  headerLabel: {
    ...makeFontStyleObject(26, "TitilliumSansPro", 30, "Semibold")
  },
  headerLabelExperimental: {
    ...makeFontStyleObject(26, "Titillio", 30, "Semibold")
  }
});

const MemoizedItwPresentationDetailsHeader = memo(ItwPresentationDetailsHeader);

export { MemoizedItwPresentationDetailsHeader as ItwPresentationDetailsHeader };

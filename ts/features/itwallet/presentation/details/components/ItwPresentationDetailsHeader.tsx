import {
  Body,
  ContentWrapper,
  H2,
  Tag,
  makeFontStyleObject,
  useIOExperimentalDesign,
  useIOThemeContext
} from "@pagopa/io-app-design-system";
import Color from "color";
import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import ItwAvatar from "../../../../../../img/features/itWallet/brand/itw_avatar.svg";
import FocusAwareStatusBar from "../../../../../components/ui/FocusAwareStatusBar.tsx";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { getCredentialCardConfig } from "../../../common/components/ItwCredentialCard/config.ts";
import { ItwCredentialDetailCard } from "../../../common/components/ItwCredentialDetailCard.tsx";
import {
  getCredentialNameFromType,
  tagPropsByStatus
} from "../../../common/utils/itwCredentialUtils.ts";
import { getItwAuthSource } from "../../../common/utils/itwMetadataUtils.ts";
import { CredentialType } from "../../../common/utils/itwMocksUtils.ts";
import { useThemeColorByCredentialType } from "../../../common/utils/itwStyleUtils.ts";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils.ts";
import { itwCredentialStatusSelector } from "../../../credentials/store/selectors";
import { itwCredentialsCatalogueByTypesSelector } from "../../../credentialsCatalogue/store/selectors";
import { useItwDisplayCredentialStatus } from "../hooks/useItwDisplayCredentialStatus";
import { ItwPresentationCredentialCard } from "./ItwPresentationCredentialCard.tsx";

type ItwPresentationDetailsHeaderProps = {
  credential: CredentialMetadata;
};

const credentialsWithSkeumorphicCard: ReadonlyArray<string> = [
  CredentialType.DRIVING_LICENSE,
  CredentialType.EUROPEAN_DISABILITY_CARD
];

const ItwPresentationDetailsHeader = ({
  credential
}: ItwPresentationDetailsHeaderProps) => {
  const { themeType } = useIOThemeContext();
  const { color } = getCredentialCardConfig(
    credential.credentialType,
    themeType
  );
  const { status: rawStatus = "valid" } = useIOSelector(state =>
    itwCredentialStatusSelector(state, credential.credentialType)
  );
  const displayStatus = useItwDisplayCredentialStatus(rawStatus);
  const statusTagProps = tagPropsByStatus[displayStatus];
  const credentialsCatalogue = useIOSelector(
    itwCredentialsCatalogueByTypesSelector
  );
  const authSource = credentialsCatalogue?.[credential.credentialType]
    ? getItwAuthSource(credentialsCatalogue[credential.credentialType])
    : undefined;

  const isLight = useMemo(() => Color(color).isLight(), [color]);

  return (
    <>
      <FocusAwareStatusBar
        backgroundColor={color}
        barStyle={isLight ? "dark-content" : "light-content"}
      />

      <ItwCredentialDetailCard
        credentialType={credential.credentialType}
        credentialStatus={displayStatus}
      >
        <ItwAvatar width={48} height={48} />
        <H2 style={styles.nameText} color={isLight ? "black" : "white"}>
          {getCredentialNameFromType(credential.credentialType, true)}
        </H2>
        {authSource && (
          <Body
            style={styles.authSourceText}
            color={isLight ? "black" : "white"}
          >
            {authSource}
          </Body>
        )}
        {statusTagProps && (
          <View style={{ marginTop: 16 }}>
            <Tag forceLightMode {...statusTagProps} />
          </View>
        )}
      </ItwCredentialDetailCard>
    </>
  );
};

/**
 * @deprecated Legacy header component for presentation details, to be used until the new design is enabled for all users.
 */
const ItwPresentationDetailsHeaderLegacy = ({
  credential
}: ItwPresentationDetailsHeaderProps) => {
  const { isExperimental } = useIOExperimentalDesign();
  const { statusBarStyle, backgroundColor, textColor } =
    useThemeColorByCredentialType(credential.credentialType);

  const headerContent = useMemo(() => {
    if (credentialsWithSkeumorphicCard.includes(credential.credentialType)) {
      return <ItwPresentationCredentialCard credential={credential} />;
    }

    return (
      <View style={[styles.legacyHeader, { backgroundColor }]}>
        <ContentWrapper>
          <Text
            style={[
              isExperimental
                ? styles.legacyHeaderLabelExperimental
                : styles.legacyHeaderLabel,
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
    <>
      <FocusAwareStatusBar
        backgroundColor={backgroundColor}
        barStyle={statusBarStyle}
      />
      {headerContent}
    </>
  );
};

const styles = StyleSheet.create({
  nameText: {
    textAlign: "center",
    marginTop: 16
  },
  authSourceText: {
    textAlign: "center",
    marginHorizontal: 16,
    paddingTop: 4
  },
  legacyHeader: {
    marginTop: -300,
    paddingTop: 300,
    justifyContent: "flex-end",
    paddingBottom: 24
  },
  legacyHeaderLabel: {
    ...makeFontStyleObject(26, "TitilliumSansPro", 30, "Semibold")
  },
  legacyHeaderLabelExperimental: {
    ...makeFontStyleObject(26, "Titillio", 30, "Semibold")
  }
});

const MemoizedItwPresentationDetailsHeader = memo(ItwPresentationDetailsHeader);

/**
 * @deprecated
 */
const MemoizedItwPresentationDetailsHeaderLegacy = memo(
  ItwPresentationDetailsHeaderLegacy
);

export {
  MemoizedItwPresentationDetailsHeader as ItwPresentationDetailsHeader,
  MemoizedItwPresentationDetailsHeaderLegacy as ItwPresentationDetailsHeaderLegacy
};

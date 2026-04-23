import {
  Body,
  ContentWrapper,
  H2,
  IOColors,
  Tag,
  makeFontStyleObject,
  useIOExperimentalDesign
} from "@pagopa/io-app-design-system";
import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import FocusAwareStatusBar from "../../../../../components/ui/FocusAwareStatusBar.tsx";
import { useIOSelector } from "../../../../../store/hooks.ts";
import ItwAvatar from "../../../../../../img/features/itWallet/brand/itw_avatar.svg";
import { ItwCredentialDetailCard } from "../../../common/components/ItwCredentialDetailCard.tsx";
import { getItwAuthSource } from "../../../common/utils/itwMetadataUtils.ts";
import { tagPropsByStatus } from "../../../common/utils/itwCredentialUtils.ts";
import { CredentialType } from "../../../common/utils/itwMocksUtils.ts";
import { useThemeColorByCredentialType } from "../../../common/utils/itwStyleUtils.ts";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils.ts";
import {
  itwCatalogueTranslationsByLocaleSelector,
  itwCredentialsCatalogueByTypesSelector
} from "../../../credentialsCatalogue/store/selectors";
import { itwCredentialStatusSelector } from "../../../credentials/store/selectors";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { useItwDisplayCredentialStatus } from "../hooks/useItwDisplayCredentialStatus";
import { useItwCredentialName } from "../../../common/hooks/useItwCredentialName";
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
  const { isExperimental } = useIOExperimentalDesign();
  const withL3Design = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const { statusBarStyle, backgroundColor, textColor } =
    useThemeColorByCredentialType(credential.credentialType);
  const { status: rawStatus = "valid" } = useIOSelector(state =>
    itwCredentialStatusSelector(state, credential.credentialType)
  );
  const displayStatus = useItwDisplayCredentialStatus(rawStatus);
  const statusTagProps = tagPropsByStatus[displayStatus];
  const credentialsCatalogue = useIOSelector(
    itwCredentialsCatalogueByTypesSelector
  );
  const translationsByLocale = useIOSelector(
    itwCatalogueTranslationsByLocaleSelector
  );
  const catalogueMeta = credentialsCatalogue?.[credential.credentialType];
  const authSource = catalogueMeta
    ? getItwAuthSource(catalogueMeta, translationsByLocale)
    : undefined;
  const credentialName = useItwCredentialName(credential.credentialType);

  const headerContent = useMemo(() => {
    if (!withL3Design) {
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
              {credentialName}
            </Text>
          </ContentWrapper>
        </View>
      );
    }

    return (
      <ItwCredentialDetailCard
        credentialType={credential.credentialType}
        credentialStatus={displayStatus}
      >
        <ItwAvatar width={48} height={48} />
        <H2
          style={{
            paddingTop: 16,
            textAlign: "center",
            color: IOColors["blueIO-850"]
          }}
        >
          {credentialName}
        </H2>
        {authSource && (
          <Body
            style={{
              textAlign: "center",
              marginHorizontal: 16,
              paddingTop: 4,
              color: IOColors["blueIO-850"]
            }}
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
    );
  }, [
    authSource,
    backgroundColor,
    credential,
    credentialName,
    displayStatus,
    isExperimental,
    statusTagProps,
    textColor,
    withL3Design
  ]);

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

export { MemoizedItwPresentationDetailsHeader as ItwPresentationDetailsHeader };

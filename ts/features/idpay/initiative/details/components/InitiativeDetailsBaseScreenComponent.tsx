import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { format } from "date-fns";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Image, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { InitiativeDTO } from "../../../../../../definitions/idpay/InitiativeDTO";
import { ContentWrapper } from "../../../../../components/core/ContentWrapper";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { H1 } from "../../../../../components/core/typography/H1";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import themeVariables from "../../../../../theme/variables";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { Skeleton } from "../../../common/components/Skeleton";
import { BonusCounter, InitiativeBonusCounter } from "./InitiativeBonusCounter";
import { InitiativeStatusLabel } from "./InitiativeStatusLabel";

type BaseProps = {
  footer?: React.ReactElement;
  onHeaderDetailsPress: () => void;
  counters?: ReadonlyArray<BonusCounter>;
};

type Props =
  | { isLoading: true }
  | ({ isLoading?: false } & { initiative: InitiativeDTO });

const InitiativeDetailsBaseScreenComponent = (
  props: React.PropsWithChildren<BaseProps & Props>
) => {
  const safeAreaInsets = useSafeAreaInsets();

  const renderContent = () => {
    if (props.isLoading) {
      return (
        <>
          <View style={styles.hero} testID={"IDPayDetailsHeroSkeletonTestID"}>
            <View style={styles.heroDetails}>
              <Skeleton height={56} width={56} color="#CED8F9" />
              <VSpacer size={16} />
              <Skeleton height={24} width={180} color="#CED8F9" />
              <VSpacer size={8} />
              <Skeleton height={16} width={100} color="#CED8F9" />
              <VSpacer size={8} />
              <Skeleton height={16} width={100} color="#CED8F9" />
            </View>
            <VSpacer size={32} />
            {props.counters && (
              <View style={styles.heroContent}>
                {props.counters.map((props, index) => (
                  <InitiativeBonusCounter key={index} {...props} />
                ))}
              </View>
            )}
          </View>
          <View style={styles.lastUpdate}>
            <Skeleton height={16} width={180} />
          </View>
          <VSpacer size={8} />
          {props.children}
        </>
      );
    }

    const { initiative } = props;

    const logoComponent = pipe(
      NonEmptyString.decode(initiative.logoURL),
      O.fromEither,
      O.fold(
        () => undefined,
        logoUrl => (
          <Image
            testID="IDPayInitiativeLogoTestID"
            source={{ uri: logoUrl }}
            style={styles.initiativeLogo}
          />
        )
      )
    );

    const lastUpdateComponent = pipe(
      initiative.lastCounterUpdate,
      O.fromNullable,
      O.map(date => format(date, "DD/MM/YYYY, HH:mm")),
      O.fold(
        () => undefined,
        lastUpdated => (
          <LabelSmall
            style={styles.lastUpdate}
            color="bluegrey"
            weight="Regular"
            testID={"IDPayDetailsLastUpdatedTestID"}
          >
            {I18n.t(
              "idpay.initiative.details.initiativeDetailsScreen.configured.lastUpdated"
            )}
            {lastUpdated}
          </LabelSmall>
        )
      )
    );

    return (
      <>
        <View style={styles.hero} testID={"IDPayDetailsHeroTestID"}>
          <ContentWrapper>
            <View style={styles.heroDetails}>
              {logoComponent}
              <H1 style={styles.initiativeName}>{initiative.initiativeName}</H1>
              <LabelSmall color={"black"} weight="Regular">
                {initiative.organizationName}
              </LabelSmall>
              <VSpacer size={8} />
              <InitiativeStatusLabel
                status={initiative.status}
                endDate={initiative.endDate}
              />
            </View>
            <VSpacer size={32} />
            {props.counters && (
              <View style={styles.heroContent}>
                {props.counters.map((props, index) => (
                  <InitiativeBonusCounter key={index} {...props} />
                ))}
              </View>
            )}
          </ContentWrapper>
        </View>
        {lastUpdateComponent}
        <VSpacer size={8} />
        {props.children}
      </>
    );
  };

  return (
    <BaseScreenComponent
      goBack={true}
      headerBackgroundColor={IOColors["blueIO-50"]}
      contextualHelp={emptyContextualHelp}
      customRightIcon={{
        iconName: "info",
        onPress: props.onHeaderDetailsPress,
        // Leaving the value blank because there isn't a similar case
        // in the entire app. It should be something like "View more info"
        accessibilityLabel: ""
      }}
    >
      <StatusBar
        barStyle={"dark-content"}
        backgroundColor={IOColors["blueIO-50"]}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        scrollIndicatorInsets={{ right: 1 }}
      >
        {renderContent()}
      </ScrollView>
      {props.footer && (
        <View
          style={[
            IOStyles.footer,
            {
              paddingBottom:
                safeAreaInsets.bottom + themeVariables.footerPaddingBottom
            }
          ]}
        >
          {props.footer}
        </View>
      )}
    </BaseScreenComponent>
  );
};

const styles = StyleSheet.create({
  hero: {
    backgroundColor: IOColors["blueIO-50"],
    borderBottomEndRadius: 24,
    borderBottomStartRadius: 24,
    paddingVertical: 24,
    paddingTop: 500,
    marginTop: -500
  },
  initiativeName: {
    textAlign: "center"
  },
  initiativeLogo: {
    resizeMode: "cover",
    backgroundColor: IOColors.white,
    height: 56,
    width: 56,
    borderRadius: 8,
    marginBottom: 8
  },
  heroDetails: {
    flex: 2,
    alignItems: "center"
  },
  heroContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  scrollContainer: {
    flexGrow: 1
  },
  lastUpdate: {
    alignSelf: "center",
    alignItems: "center",
    padding: 16
  }
});

export default InitiativeDetailsBaseScreenComponent;

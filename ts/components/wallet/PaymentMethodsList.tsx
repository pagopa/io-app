/**
 * This component will display the payment methods that can be registered
 * on the app
 */
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { FC } from "react";
import {
  View,
  Alert,
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  Pressable
} from "react-native";
import { SvgProps } from "react-native-svg";
import { connect } from "react-redux";
import { Icon, HSpacer, VSpacer, Divider } from "@pagopa/io-app-design-system";
import { BackendStatus } from "../../../definitions/content/BackendStatus";
import { LevelEnum } from "../../../definitions/content/SectionStatus";
import I18n from "../../i18n";
import {
  SectionStatusKey,
  sectionStatusSelector
} from "../../store/reducers/backendStatus/sectionStatus";
import { GlobalState } from "../../store/reducers/types";
import { getFullLocale } from "../../utils/locale";
import { IOBadge, IOBadgeOutlineColors } from "../core/IOBadge";
import { H3 } from "../core/typography/H3";
import { H5 } from "../core/typography/H5";
import { IOStyles } from "../core/variables/IOStyles";
import { withLightModalContext } from "../helpers/withLightModalContext";
import { LightModalContextInterface } from "../ui/LightModal";

type OwnProps = Readonly<{
  paymentMethods: ReadonlyArray<IPaymentMethod>;
}>;

type Props = OwnProps &
  LightModalContextInterface &
  ReturnType<typeof mapStateToProps>;

export type IPaymentMethod = Readonly<{
  name: string;
  description: string;
  icon: FC<SvgProps>;
  maxFee?: string;
  status: "implemented" | "incoming" | "notImplemented";
  section?: SectionStatusKey;
  onPress?: () => void;
}>;

const styles = StyleSheet.create({
  container: {
    paddingRight: 10,
    paddingLeft: 0
  },
  flexColumn: {
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 1
  },
  descriptionPadding: { paddingRight: 24 }
});

export const showPaymentMethodIncomingAlert = () =>
  Alert.alert(
    I18n.t("wallet.incoming.title"),
    I18n.t("wallet.incoming.message"),
    undefined,
    { cancelable: true }
  );

/**
 * return a status badge displaying the section.badge label
 * the badge background color is according with the status (normal | warning | critical)
 * if it is critical status, it returns also an alert function, undefined otherwise
 * the alert display a title (section.badge) and a message (section.message) with default dismiss button
 * @param paymentMethod
 * @param sectionStatus
 */
const getBadgeStatus = (
  paymentMethod: IPaymentMethod,
  sectionStatus: O.Option<BackendStatus["sections"]>
): null | { badge: React.ReactNode; alert?: () => void } => {
  const itemSection = paymentMethod.section;

  const badgeColorMap: Record<LevelEnum, IOBadgeOutlineColors> = {
    [LevelEnum.normal]: "blue",
    [LevelEnum.warning]: "orange",
    [LevelEnum.critical]: "red"
  };

  // no section
  if (itemSection === undefined) {
    return null;
  }
  return pipe(
    sectionStatus,
    O.fold(
      () => null,
      sections => {
        const section = sections[itemSection];
        // no badge if section is not visible or badge is not defined
        if (
          section === undefined ||
          section.is_visible === false ||
          section.badge === undefined
        ) {
          return null;
        }
        const locale = getFullLocale();
        const badgeLabel = section.badge[locale];
        return {
          badge: (
            <IOBadge
              small
              text={badgeLabel}
              variant="outline"
              color={badgeColorMap[section.level]}
            />
          ),
          alert:
            section.level === LevelEnum.critical
              ? () => Alert.alert(badgeLabel, section.message[locale])
              : undefined
        };
      }
    )
  );
};

const renderListItem = (
  itemInfo: ListRenderItemInfo<IPaymentMethod>,
  sectionStatus: O.Option<BackendStatus["sections"]>
) => {
  switch (itemInfo.item.status) {
    case "implemented": {
      const badgeStatus = getBadgeStatus(itemInfo.item, sectionStatus);
      return (
        <Pressable
          accessibilityRole="button"
          onPress={badgeStatus?.alert ?? itemInfo.item.onPress}
          style={styles.container}
        >
          <VSpacer />
          <View style={IOStyles.rowSpaceBetween}>
            {itemInfo.item.icon({ width: 20, height: 20 })}
            <HSpacer size={16} />
            <View style={styles.flexColumn}>
              <View style={IOStyles.rowSpaceBetween}>
                <View>
                  {badgeStatus?.badge}
                  <H3 color={"bluegreyDark"} weight={"Semibold"}>
                    {itemInfo.item.name}
                  </H3>
                </View>
              </View>
              <H5
                color={"bluegrey"}
                weight={"Regular"}
                style={styles.descriptionPadding}
              >
                {itemInfo.item.description}
              </H5>
            </View>
            <Icon name="chevronRightListItem" color="blue" size={24} />
          </View>
          <VSpacer />
        </Pressable>
      );
    }
    case "incoming":
      return (
        <Pressable
          accessibilityRole="button"
          onPress={showPaymentMethodIncomingAlert}
          style={styles.container}
        >
          <VSpacer />
          <View style={IOStyles.rowSpaceBetween}>
            <View style={styles.flexColumn}>
              <View>
                <IOBadge
                  small
                  text={I18n.t("wallet.methods.comingSoon")}
                  variant="solid"
                  color="blue"
                />
                <H3 color={"bluegrey"} weight={"Semibold"}>
                  {itemInfo.item.name}
                </H3>
              </View>
              <H5
                color={"bluegrey"}
                weight={"Regular"}
                style={styles.descriptionPadding}
              >
                {itemInfo.item.description}
              </H5>
            </View>
          </View>
          <VSpacer />
        </Pressable>
      );
    case "notImplemented":
      return null;
  }
};

const PaymentMethodsList: React.FunctionComponent<Props> = (props: Props) => (
  <View style={IOStyles.horizontalContentPadding}>
    <VSpacer size={24} />

    <FlatList
      removeClippedSubviews={false}
      data={props.paymentMethods}
      keyExtractor={item => item.name}
      ItemSeparatorComponent={() => <Divider />}
      ListFooterComponent={<VSpacer size={16} />}
      renderItem={i => renderListItem(i, props.sectionStatus)}
    />
  </View>
);
const mapStateToProps = (state: GlobalState) => ({
  sectionStatus: sectionStatusSelector(state)
});
export default connect(mapStateToProps)(
  withLightModalContext(PaymentMethodsList)
);

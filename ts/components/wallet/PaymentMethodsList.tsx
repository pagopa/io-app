/**
 * This component will display the payment methods that can be registered
 * on the app
 */
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Badge, ListItem, Text as NBText } from "native-base";
import * as React from "react";
import { FC } from "react";
import {
  View,
  Alert,
  FlatList,
  ListRenderItemInfo,
  Platform,
  StyleSheet
} from "react-native";
import { SvgProps } from "react-native-svg";
import { connect } from "react-redux";
import { BackendStatus } from "../../../definitions/content/BackendStatus";
import { LevelEnum } from "../../../definitions/content/SectionStatus";
import I18n from "../../i18n";
import {
  backendStatusSelector,
  SectionStatusKey
} from "../../store/reducers/backendStatus";
import { GlobalState } from "../../store/reducers/types";
import { getFullLocale } from "../../utils/locale";
import { HSpacer, VSpacer } from "../core/spacer/Spacer";
import { H3 } from "../core/typography/H3";
import { H5 } from "../core/typography/H5";
import { IOColors } from "../core/variables/IOColors";
import { IOStyles } from "../core/variables/IOStyles";
import { withLightModalContext } from "../helpers/withLightModalContext";
import { statusColorMap } from "../SectionStatus";
import IconFont from "../ui/IconFont";
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
    paddingLeft: 0,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  flexColumn: {
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 1
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  descriptionPadding: { paddingRight: 24 },

  badgeContainer: { height: 18, backgroundColor: IOColors.blue },
  badgeText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: Platform.select({ android: 2, default: 0 })
  }
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
 * @param backendStatus
 */
const getBadgeStatus = (
  paymentMethod: IPaymentMethod,
  backendStatus: O.Option<BackendStatus>
): null | { badge: React.ReactNode; alert?: () => void } => {
  const itemSection = paymentMethod.section;
  // no section
  if (itemSection === undefined) {
    return null;
  }
  return pipe(
    backendStatus,
    O.chainNullableK(bs => bs.sections),
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
            <Badge
              style={[
                styles.badgeContainer,
                { backgroundColor: statusColorMap[section.level] }
              ]}
            >
              <NBText style={styles.badgeText} semibold={true}>
                {badgeLabel}
              </NBText>
            </Badge>
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
  paymentMethodsLength: number,
  backendStatus: O.Option<BackendStatus>
) => {
  switch (itemInfo.item.status) {
    case "implemented": {
      const badgeStatus = getBadgeStatus(itemInfo.item, backendStatus);
      return (
        <ListItem
          onPress={badgeStatus?.alert ?? itemInfo.item.onPress}
          style={styles.container}
          first={itemInfo.index === 0}
          last={itemInfo.index === paymentMethodsLength}
        >
          {itemInfo.item.icon({ width: 20, height: 20 })}
          <HSpacer size={16} />
          <View style={styles.flexColumn}>
            <View style={styles.row}>
              <View>
                {badgeStatus?.badge}
                <H3 color={"bluegreyDark"} weight={"SemiBold"}>
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
          <IconFont name={"io-right"} color={IOColors.blue} size={24} />
        </ListItem>
      );
    }
    case "incoming":
      return (
        <ListItem
          onPress={showPaymentMethodIncomingAlert}
          style={styles.container}
          first={itemInfo.index === 0}
          last={itemInfo.index === paymentMethodsLength}
        >
          <View style={styles.flexColumn}>
            <View>
              <Badge style={styles.badgeContainer}>
                <NBText style={styles.badgeText} semibold={true}>
                  {I18n.t("wallet.methods.comingSoon")}
                </NBText>
              </Badge>
              <H3 color={"bluegrey"} weight={"SemiBold"}>
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
        </ListItem>
      );
    case "notImplemented":
      return null;
  }
};

const PaymentMethodsList: React.FunctionComponent<Props> = (props: Props) => (
  <>
    <VSpacer size={24} />
    <View style={IOStyles.horizontalContentPadding}>
      <FlatList
        removeClippedSubviews={false}
        data={props.paymentMethods}
        keyExtractor={item => item.name}
        ListFooterComponent={<VSpacer size={16} />}
        renderItem={i =>
          renderListItem(
            i,
            props.paymentMethods.filter(pm => pm.status !== "notImplemented")
              .length,
            props.sectionStatus
          )
        }
      />
    </View>
  </>
);
const mapStateToProps = (state: GlobalState) => ({
  sectionStatus: backendStatusSelector(state)
});
export default connect(mapStateToProps)(
  withLightModalContext(PaymentMethodsList)
);

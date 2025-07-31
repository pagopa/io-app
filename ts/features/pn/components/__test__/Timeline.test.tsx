import { createStore } from "redux";
import { Timeline, TimelineItemProps, TimelineProps } from "../Timeline";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import PN_ROUTES from "../../navigation/routes";

const defaultProps: TimelineProps = {
  data: [
    {
      day: "1",
      description: "Depositata",
      month: "01",
      time: "01:00",
      status: "viewed"
    },
    {
      day: "3",
      description: "Annullata",
      month: "02",
      time: "03:00",
      status: "cancelled"
    },
    {
      day: "6",
      description: "Consegnata",
      month: "03",
      time: "05:00",
      status: "default"
    },
    {
      day: "9",
      description: "Invio in corso",
      month: "04",
      time: "07:00",
      status: "default"
    },
    {
      day: "11",
      description: "Perfezionata per decorrenza termini",
      month: "05",
      time: "09:00",
      status: "effective"
    },
    {
      day: "14",
      description: "Destinatario irreperibile",
      month: "06",
      time: "11:00",
      status: "unreachable"
    },
    {
      day: "15",
      description: "Avvenuto accesso",
      month: "07",
      time: "13:00",
      status: "viewed"
    },
    {
      day: "18",
      description: "Pagata",
      month: "08",
      time: "15:00",
      status: "default"
    },
    {
      day: "21",
      description: "REFUSED",
      month: "09",
      time: "17:00",
      status: "default"
    },
    {
      day: "24",
      description: "IN VALIDATION",
      month: "10",
      time: "19:00",
      status: "default"
    },
    {
      day: "27",
      description: "Depositata",
      month: "11",
      time: "21:00",
      status: "default"
    },
    {
      day: "30",
      description: "Annullata",
      month: "12",
      time: "23:00",
      status: "cancelled"
    }
  ],
  footerHeight: 116
};

describe("Timeline component", () => {
  it("should match the snapshot, empty data", () => {
    const component = renderComponent([], 116);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match the snapshot, default data", () => {
    const component = renderComponent(
      defaultProps.data,
      defaultProps.footerHeight
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = (
  data: ReadonlyArray<TimelineItemProps>,
  footerHeight: number
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  return renderScreenWithNavigationStoreContext(
    () => <Timeline data={data} footerHeight={footerHeight} />,
    PN_ROUTES.MESSAGE_DETAILS,
    {},
    store
  );
};

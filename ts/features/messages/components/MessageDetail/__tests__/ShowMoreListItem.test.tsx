import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { ShowMoreListItem, ShowMoreSection } from "../ShowMoreListItem";
import { MESSAGES_ROUTES } from "../../../navigation/routes";

describe("ShowMoreListItem", () => {
  it("should match snapshot, no data", () => {
    const sections: ReadonlyArray<ShowMoreSection> = [];
    const component = renderComponent(sections);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, one section, no items", () => {
    const sections: ReadonlyArray<ShowMoreSection> = [
      {
        title: "Section 1 title",
        items: []
      }
    ];
    const component = renderComponent(sections);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, one section, one item, no icon", () => {
    const sections: ReadonlyArray<ShowMoreSection> = [
      {
        title: "Section 1 title",
        items: [
          {
            accessibilityLabel: "accessibiliy label 1",
            label: "label 1",
            value: "value 1"
          }
        ]
      }
    ];
    const component = renderComponent(sections);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, one section, one item, with icon", () => {
    const sections: ReadonlyArray<ShowMoreSection> = [
      {
        title: "Section 1 title",
        items: [
          {
            accessibilityLabel: "accessibiliy label 1",
            icon: "docPaymentCode",
            label: "label 1",
            value: "value 1"
          }
        ]
      }
    ];
    const component = renderComponent(sections);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, one section, two items, no icon", () => {
    const sections: ReadonlyArray<ShowMoreSection> = [
      {
        title: "Section 1 title",
        items: [
          {
            accessibilityLabel: "accessibiliy label 1",
            label: "label 1",
            value: "value 1"
          },
          {
            accessibilityLabel: "accessibiliy label 2",
            label: "label 2",
            value: "value 2"
          }
        ]
      }
    ];
    const component = renderComponent(sections);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, one section, two items, with icon", () => {
    const sections: ReadonlyArray<ShowMoreSection> = [
      {
        title: "Section 1 title",
        items: [
          {
            accessibilityLabel: "accessibiliy label 1",
            icon: "docPaymentCode",
            label: "label 1",
            value: "value 1"
          },
          {
            accessibilityLabel: "accessibiliy label 2",
            icon: "docPaymentCode",
            label: "label 2",
            value: "value 2"
          }
        ]
      }
    ];
    const component = renderComponent(sections);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, two sections, different item count", () => {
    const sections: ReadonlyArray<ShowMoreSection> = [
      {
        title: "Section 1 title",
        items: [
          {
            accessibilityLabel: "accessibiliy label 1",
            label: "label 1",
            value: "value 1"
          }
        ]
      },
      {
        title: "Section 2 title",
        items: [
          {
            accessibilityLabel: "accessibiliy label 2",
            label: "label 2",
            value: "value 2"
          },
          {
            accessibilityLabel: "accessibiliy label 3",
            icon: "docPaymentCode",
            label: "label 3",
            value: "value 3"
          }
        ]
      }
    ];
    const component = renderComponent(sections);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, three sections, different item count", () => {
    const sections: ReadonlyArray<ShowMoreSection> = [
      {
        title: "Section 1 title",
        items: [
          {
            accessibilityLabel: "accessibiliy label 1",
            label: "label 1",
            value: "value 1"
          }
        ]
      },
      {
        title: "Section 2 title",
        items: [
          {
            accessibilityLabel: "accessibiliy label 2",
            label: "label 2",
            value: "value 2"
          },
          {
            accessibilityLabel: "accessibiliy label 3",
            icon: "docPaymentCode",
            label: "label 3",
            value: "value 3"
          }
        ]
      },
      {
        title: "Section 3 title",
        items: [
          {
            accessibilityLabel: "accessibiliy label 4",
            label: "label 4",
            value: "value 4"
          },
          {
            accessibilityLabel: "accessibiliy label 5",
            icon: "docPaymentCode",
            label: "label 5",
            value: "value 5"
          },
          {
            accessibilityLabel: "accessibiliy label 6",
            label: "label 6",
            value: "value 6"
          }
        ]
      }
    ];
    const component = renderComponent(sections);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = (sections: ReadonlyArray<ShowMoreSection>) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <ShowMoreListItem sections={sections} />,
    MESSAGES_ROUTES.MESSAGE_DETAIL,
    {},
    store
  );
};

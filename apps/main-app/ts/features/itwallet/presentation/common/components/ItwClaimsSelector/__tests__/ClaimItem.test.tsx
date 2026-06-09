import { fireEvent, render } from "@testing-library/react-native";
import { ClaimDisplayFormat } from "../../../../../common/utils/itwClaimsUtils";
import { ClaimItem } from "../ClaimItem";

describe("ClaimItem", () => {
  it("calls onItemSelected for text claims when selection is enabled", () => {
    const item: ClaimDisplayFormat = {
      id: "name",
      label: "Name",
      value: "Mario"
    };
    const onItemSelected = jest.fn();

    const component = render(
      <ClaimItem
        item={item}
        selectionEnabled={true}
        isSelected={false}
        onItemSelected={onItemSelected}
      />
    );

    fireEvent(component.getByTestId("ListItemCheckbox"), "onValueChange", true);

    expect(onItemSelected).toHaveBeenCalledWith(item, true);
  });

  it("renders text claims as info rows when selection is disabled", () => {
    const component = render(
      <ClaimItem
        item={{ id: "name", label: "Name", value: "Mario" }}
        selectionEnabled={false}
      />
    );

    expect(component.getByText("Name")).toBeTruthy();
    expect(component.getByText("Mario")).toBeTruthy();
  });

  it("renders single nested object arrays inline", () => {
    const component = render(
      <ClaimItem
        selectionEnabled={false}
        item={{
          id: "education_degrees",
          label: "Degrees",
          value: [
            {
              programme_type_name: {
                name: "Programme",
                value: "Bachelor"
              },
              degree_course_name: {
                name: "Course",
                value: "Computer Science"
              }
            }
          ]
        }}
      />
    );

    expect(component.getByText("Programme")).toBeTruthy();
    expect(component.getByText("Bachelor")).toBeTruthy();
    expect(component.getByText("Course")).toBeTruthy();
    expect(component.getByText("Computer Science")).toBeTruthy();
  });

  it("renders multiple nested object arrays as summary rows", () => {
    const component = render(
      <ClaimItem
        selectionEnabled={false}
        item={{
          id: "education_degrees",
          label: "Degrees",
          value: [
            {
              programme_type_name: {
                name: "Programme",
                value: "Bachelor"
              },
              degree_course_name: {
                name: "Course",
                value: "Computer Science"
              }
            },
            {
              programme_type_name: {
                name: "Programme",
                value: "Master"
              },
              degree_course_name: {
                name: "Course",
                value: "AI"
              }
            }
          ]
        }}
      />
    );

    expect(component.getByText("Bachelor")).toBeTruthy();
    expect(component.getByText("Computer Science")).toBeTruthy();
    expect(component.getByText("Master")).toBeTruthy();
    expect(component.getByText("AI")).toBeTruthy();
  });

  it("renders driving privileges values", () => {
    const component = render(
      <ClaimItem
        selectionEnabled={false}
        item={{
          id: "driving_privileges",
          label: "Category",
          value:
            '[{"driving_privilege":"B","issue_date":"2020-01-01","expiry_date":"2030-01-01","restrictions_conditions":""}]'
        }}
      />
    );

    expect(component.getByText("Category")).toBeTruthy();
    expect(component.getByText("B")).toBeTruthy();
  });
});

import * as pot from "italia-ts-commons/lib/pot";
import React from "react";

import { SectionListData } from "react-native";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { ProfileState } from "../../store/reducers/profile";
import { serviceContainsText } from "../../utils/services";
import ServiceSectionListComponent from "./ServiceSectionListComponent";

type OwnProps = {
  sectionsState: // tslint:disable-next-line: readonly-array
  Array<SectionListData<pot.Pot<ServicePublic, Error>>>;
  searchText: string;
  profile: ProfileState;
  onRefresh: () => void;
  navigateToServiceDetail: (service: ServicePublic) => void;
};

type Props = OwnProps;

type State = {
  potFilteredServiceSectionsStates: pot.Pot<
    // tslint:disable-next-line: readonly-array
    Array<SectionListData<pot.Pot<ServicePublic, Error>>>,
    Error
  >;
};

/**
 * Filter only the services that match the searchText.
 */
const generateSectionsServicesStateMatchingSearchTextArray = (
  // tslint:disable-next-line: readonly-array
  servicesState: Array<SectionListData<pot.Pot<ServicePublic, Error>>>,
  searchText: string
  // tslint:disable-next-line: readonly-array
): Array<SectionListData<pot.Pot<ServicePublic, Error>>> => {
  // tslint:disable-next-line: readonly-array prefer-const no-var-keyword
  var result: Array<SectionListData<pot.Pot<ServicePublic, Error>>> = [];
  servicesState.forEach(sectionList => {
    const filtered = filterSectionListDataMatchingSearchText(
      sectionList,
      searchText
    );
    if (filtered != null) {
      result.push(filtered);
    }
  });
  return result;
};

function filterSectionListDataMatchingSearchText(
  sectionListData: SectionListData<pot.Pot<ServicePublic, Error>>,
  searchText: string
) {
  const filteredData = sectionListData.data
    .map(potService =>
      pot.filter(potService, servicePublic =>
        // Search in service properties
        serviceContainsText(servicePublic, searchText)
      )
    )
    .filter(pot.isSome);

  const sectionListDataFiltered = {
    title: sectionListData.title,
    data: filteredData
  };
  return filteredData.length > 0 ? sectionListDataFiltered : null;
}

/**
 * A component that renders a list of services that match a search text.
 */
class ServicesSearch extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      potFilteredServiceSectionsStates: pot.none
    };
  }

  public componentDidMount() {
    const { sectionsState, searchText } = this.props;
    const { potFilteredServiceSectionsStates } = this.state;

    // Set filtering status
    this.setState({
      potFilteredServiceSectionsStates: pot.toLoading(
        potFilteredServiceSectionsStates
      )
    });

    // Start filtering services
    const filteredServiceSectionsStates = generateSectionsServicesStateMatchingSearchTextArray(
      sectionsState,
      searchText
    );

    // Unset filtering status
    this.setState({
      potFilteredServiceSectionsStates: pot.some(filteredServiceSectionsStates)
    });
  }

  public componentDidUpdate(prevProps: Props) {
    const {
      sectionsState: prevServicesState,
      searchText: prevSearchText
    } = prevProps;
    const { sectionsState, searchText } = this.props;
    const { potFilteredServiceSectionsStates } = this.state;

    if (sectionsState !== prevServicesState || searchText !== prevSearchText) {
      // Set filtering status
      this.setState({
        potFilteredServiceSectionsStates: pot.toLoading(
          potFilteredServiceSectionsStates
        )
      });

      // Start filtering services
      const filteredServiceSectionsStates = generateSectionsServicesStateMatchingSearchTextArray(
        sectionsState,
        searchText
      );

      // Unset filtering status
      this.setState({
        potFilteredServiceSectionsStates: pot.some(
          filteredServiceSectionsStates
        )
      });
    }
  }

  public render() {
    const { potFilteredServiceSectionsStates } = this.state;
    const { onRefresh } = this.props;

    const isFiltering = pot.isLoading(potFilteredServiceSectionsStates);

    const filteredServiceSectionsStates = pot.getOrElse(
      potFilteredServiceSectionsStates,
      []
    );

    return (
      <ServiceSectionListComponent
        {...this.props}
        sections={filteredServiceSectionsStates}
        profile={this.props.profile}
        isRefreshing={isFiltering}
        onRefresh={onRefresh}
        onSelect={this.handleOnServiceSelect}
      />
    );
  }

  private handleOnServiceSelect = (service: ServicePublic) => {
    this.props.navigateToServiceDetail(service);
  };
}

export default ServicesSearch;

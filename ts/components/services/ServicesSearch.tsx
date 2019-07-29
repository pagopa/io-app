import * as pot from "italia-ts-commons/lib/pot";
import React from "react";

import { SectionListData } from "react-native";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { ReadStateByServicesId } from "../../store/reducers/entities/services/readStateByServiceId";

import { ProfileState } from "../../store/reducers/profile";
import { serviceContainsText } from "../../utils/services";
import { SearchNoResultMessage } from "../search/SearchNoResultMessage";
import ServiceSectionListComponent from "./ServiceSectionListComponent";

type OwnProps = {
  sectionsState: // tslint:disable-next-line: readonly-array
  Array<SectionListData<pot.Pot<ServicePublic, Error>>>;
  searchText: string;
  profile: ProfileState;
  onRefresh: () => void;
  navigateToServiceDetail: (service: ServicePublic) => void;
  readServices: ReadStateByServicesId;
  isExperimentalFeaturesEnabled?: boolean;
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
const generateSectionsServicesStateMatchingSearchTextArrayAsync = (
  // tslint:disable-next-line: readonly-array
  servicesState: Array<SectionListData<pot.Pot<ServicePublic, Error>>>,
  searchText: string
  // tslint:disable-next-line: readonly-array
): Promise<Array<SectionListData<pot.Pot<ServicePublic, Error>>>> => {
  return new Promise(resolve => {
    // tslint:disable-next-line: readonly-array
    const result: Array<SectionListData<pot.Pot<ServicePublic, Error>>> = [];
    servicesState.forEach(sectionList => {
      const filtered = filterSectionListDataMatchingSearchText(
        sectionList,
        searchText
      );
      if (filtered != null) {
        result.push(filtered);
      }
    });

    resolve(result);
  });
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
    organizationName: sectionListData.organizationName,
    organizationFiscalCode: sectionListData.organizationFiscalCode,
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
      potFilteredServiceSectionsStates: pot.noneLoading
    };
  }

  public async componentDidMount() {
    const { sectionsState, searchText } = this.props;
    const { potFilteredServiceSectionsStates } = this.state;

    // Set filtering status
    this.setState({
      potFilteredServiceSectionsStates: pot.toLoading(
        potFilteredServiceSectionsStates
      )
    });

    // Start filtering services
    const filteredServiceSectionsStates = await generateSectionsServicesStateMatchingSearchTextArrayAsync(
      sectionsState,
      searchText
    );

    // Unset filtering status
    this.setState({
      potFilteredServiceSectionsStates: pot.some(filteredServiceSectionsStates)
    });
  }

  public async componentDidUpdate(prevProps: Props) {
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
      const filteredServiceSectionsStates = await generateSectionsServicesStateMatchingSearchTextArrayAsync(
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

    return filteredServiceSectionsStates.length > 0 ? (
      <ServiceSectionListComponent
        {...this.props}
        sections={filteredServiceSectionsStates}
        profile={this.props.profile}
        isRefreshing={isFiltering}
        onRefresh={onRefresh}
        onSelect={this.handleOnServiceSelect}
        isExperimentalFeaturesEnabled={this.props.isExperimentalFeaturesEnabled}
      />
    ) : (
      <SearchNoResultMessage errorType="NoResultsFound" />
    );
  }

  private handleOnServiceSelect = (service: ServicePublic) => {
    this.props.navigateToServiceDetail(service);
  };
}

export default ServicesSearch;

import React from "react";
import PropTypes from "prop-types";
import scriptLoader from "../../utils/script-loader";
import Typeahead from "../typeahead";
import TextInput from "../text-input";

const getGoogleMapsApiUrlWithKey = (googleMapsApiKey) =>
  `https://maps.googleapis.com/maps/api/js?libraries=places&key=${googleMapsApiKey}`;

const geocodeByPlaceId = (geocoder, okStatus, placeId) =>
  new Promise((resolve, reject) => {
    geocoder.geocode({ placeId }, (results, status) => {
      if (status !== okStatus) {
        reject(status);
      }
      resolve(results);
    });
  });

const defaultPlaceFields = [
  /* a predefined list of desired parts of an address */
  ["street_number", "long_name"],
  ["route", "long_name"],
  ["locality", "long_name"],
  ["postal_town", "long_name"],
  ["administrative_area_level_1", "long_name"],
  ["postal_code", "long_name"],
  ["country", "short_name"],
];

const findParts = (name) => (component) =>
  component &&
  component.types &&
  component.types.length &&
  component.types.includes(name);

const reduceParts = (place) => (parts, [name, alias]) => {
  const component = place.address_components.find(findParts(name));
  const updatedParts = { ...parts };
  updatedParts[name] = component ? component[alias] : null;
  return updatedParts;
};

const getPlace = (
  geocoder,
  okStatus,
  placeId,
  placeFields = defaultPlaceFields
) =>
  /*
    a Promise that get different parts of address from placeId using google maps geocoder
    input:
      geocoder: google maps api geocoder
      okStatus: a string to identify a successful response status
      placeId: string or number that represent google maps placeId
      placeFields: (optional) a list of desired parts of an address
    resolved output:
      parts: a list of parts such as street_number, route
  */
  geocodeByPlaceId(geocoder, okStatus, placeId).then((results) => {
    const place = results ? results[0] : null;
    return place ? placeFields.reduce(reduceParts(place), {}) : null;
  });

const fetchSuggestions = (
  autocompleteService,
  okStatus,
  value,
  searchOptions = {}
) =>
  /*
    a Promise that uses AutocompleteService to predict places based on text
    input:
      autocompleteService: google maps api AutocompleteService
      okStatus: a string to identify a successful response status
      value: text input to search for
      searchOptions: (optional) object containing options for searching
    resolved output:
      suggestions: a list of place prediction objects
  */
  new Promise((resolve, reject) => {
    if (!value.length) return reject(new Error("Empty value"));

    autocompleteService.getPlacePredictions(
      {
        ...searchOptions,
        input: value,
      },
      (suggestions, status) => {
        if (status !== okStatus) {
          return reject(new Error("Autocomplete service got errored"));
        }

        return resolve(suggestions);
      }
    );

    return null;
  });

class AutocompleteAddress extends React.Component {
  state = {
    googleMapsApiReady: false,
    suggestions: [],
  };

  componentDidMount() {
    scriptLoader([
      {
        id: "googleMapsApi",
        url: getGoogleMapsApiUrlWithKey(this.props.googleMapsApiKey),
        callback: this.enableAutocomplete,
      },
    ]);
  }

  /*
    fromat strings of options from suggestion items
    for now it takes places' description
  */
  getStringFromItem = (suggestion) =>
    suggestion ? suggestion.description : "";

  enableAutocomplete = () => {
    if (!window.google || !window.google.maps.places) {
      return;
    }

    this.autocompleteService = new window.google.maps.places.AutocompleteService();
    this.autocompleteServiceOK =
      window.google.maps.places.PlacesServiceStatus.OK;
    this.geocoder = new window.google.maps.Geocoder();
    this.geocoderOk = window.google.maps.GeocoderStatus.OK;

    this.setState({ googleMapsApiReady: true });
  };

  handleInputChange = (event) => {
    const { onChange, searchOptions, callbackOnFetch } = this.props;
    const { value } = event.target;
    onChange(event);
    if (value !== "") {
      return fetchSuggestions(
        this.autocompleteService,
        this.autocompleteServiceOK,
        value,
        searchOptions
      ).then((suggestions) => {
        this.setState({ suggestions });
        if (callbackOnFetch) {
          /* callbackOnFetch is an optional callback on fetching suggestions
            input: a list of sugesting places
          */
          callbackOnFetch(suggestions);
        }
      });
    }
    return this.setState({ suggestions: [] });
  };

  filterInput = (activeSuggestion) => {
    /* filterInput is an optional processor of selection before converting to input
      by default it uses items' description
      input: selected suggesting place
    */
    const { filterInput } = this.props;
    return filterInput
      ? filterInput(activeSuggestion)
      : activeSuggestion.description;
  };

  handleSuggestionSelection = (value) => {
    const {
      handleSuggestionSelection,
      onChange,
      placeFields,
      name,
    } = this.props;
    const activeSuggestion = this.state.suggestions.filter(
      (s) => s.description === value
    )[0];
    return getPlace(
      this.geocoder,
      this.geocoderOk,
      activeSuggestion.place_id,
      placeFields
    )
      .catch(() => {})
      .then((parts) => {
        activeSuggestion.parts = parts;
        const filteredSuggestion = this.filterInput(activeSuggestion);
        onChange({ target: { name, value: filteredSuggestion } });
        if (handleSuggestionSelection) {
          /* optional callback on selecting a suggestion
          input: selected suggesting place
        */
          handleSuggestionSelection(activeSuggestion);
        }
      });
  };

  render() {
    const {
      googleMapsApiKey,
      searchOptions,
      name,
      callbackOnFetch,
      filterInput,
      handleSuggestionSelection,
      partialMatch,
      ...props
    } = this.props;
    if (this.state.googleMapsApiReady) {
      return (
        <Typeahead
          {...props}
          id={name}
          items={this.state.suggestions.map((s) => s.description)}
          name={name}
          onChange={this.handleInputChange}
          onSelect={this.handleSuggestionSelection}
        />
      );
    }
    return <TextInput {...props} id={name} name={name} />;
  }
}

AutocompleteAddress.propTypes = {
  ...Typeahead.propTypes,
  callbackOnFetch: PropTypes.func,
  filterInput: PropTypes.func,
  googleMapsApiKey: PropTypes.string.isRequired,
  handleSuggestionSelection: PropTypes.func,
  placeFields: PropTypes.arrayOf(PropTypes.array),
  searchOptions: PropTypes.shape({}),
};

AutocompleteAddress.defaultProps = {
  ...Typeahead.defaultProps,
  searchOptions: {},
};

export default AutocompleteAddress;

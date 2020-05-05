import React, { useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";

import MapService from "./map-service";
import Typeahead from "../typeahead";

const AutocompleteAddress = (props) => {
  const {
    callbackOnFetch,
    handleSuggestionSelection,
    mapModule,
    mapServiceOptions,
    onUpdate,
    ...otherProps
  } = props;

  const [suggestions, setSuggestions] = useState([]);

  const mapService = useMemo(
    () => new MapService(mapModule, mapServiceOptions),
    [
      mapModule,
      mapServiceOptions.searchDebounce,
      mapServiceOptions.searchThreshold,
    ]
  );

  const suggestionLabels = useMemo(
    () =>
      suggestions.map((suggestion) =>
        mapService.getSuggestionLabel(suggestion)
      ),
    [mapService, suggestions]
  );

  const onChange = useCallback(
    async (event) => {
      const inputValue = event.target.value;

      if (props.onChange) {
        props.onChange(event);
      }

      if (onUpdate) {
        onUpdate({
          type: "input_change",
          payload: inputValue,
        });
      }

      const mapSuggestions = await mapService.search(inputValue);

      setSuggestions(mapSuggestions);

      if (callbackOnFetch) {
        callbackOnFetch(mapSuggestions);
      }

      if (onUpdate) {
        onUpdate({
          type: "suggestions_change",
          payload: mapSuggestions,
        });
      }
    },
    [callbackOnFetch, mapService, onUpdate, props.onChange, setSuggestions]
  );

  const onSelect = useCallback(
    (selectedLabel) => {
      const selectedSuggestion = suggestions.find((suggestion) =>
        mapService.getSuggestionLabel(suggestion)
      );

      if (handleSuggestionSelection) {
        handleSuggestionSelection(selectedSuggestion);
      }

      if (onUpdate) {
        onUpdate({
          type: "suggestions_select",
          payload: selectedSuggestion,
        });
      }

      if (props.onChange) {
        // eslint-disable-next-line camelcase
        const FAKE_changeEvent = {
          target: {
            name: props.name,
            value: selectedLabel,
          },
        };
        props.onChange(FAKE_changeEvent);
      }
    },
    [handleSuggestionSelection, onUpdate, props.onChange, suggestions]
  );

  return (
    <Typeahead
      {...otherProps}
      id={props.name}
      items={suggestionLabels}
      name={props.name}
      onChange={onChange}
      onSelect={onSelect}
    />
  );
};

AutocompleteAddress.propTypes = {
  ...Typeahead.propTypes,
  callbackOnFetch: PropTypes.func, // (data: FetchResponse) => void
  handleSuggestionSelection: PropTypes.func, // (data: Suggestion) => void
  mapModule: PropTypes.object, // MapModule
  mapServiceOptions: PropTypes.shape({
    searchDebounce: PropTypes.number,
    searchThreshold: PropTypes.number,
  }),
  onUpdate: PropTypes.func, // (action: { type: string, payload: any }) => void
};

AutocompleteAddress.defaultProps = {
  ...Typeahead.defaultProps,
  mapServiceOptions: {},
};

export default AutocompleteAddress;

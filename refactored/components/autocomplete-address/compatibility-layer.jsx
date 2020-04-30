import React, { useCallback, useEffect, useMemo } from "react";
import PropTypes from "prop-types";

import _deprecationWarning from "../../utils/deprecation-warning";

import AutocompleteAddress from "./AutocompleteAddress";
import GoogleMapsModule from "./map-modules/google-maps";

const deprecationWarning = _deprecationWarning(AutocompleteAddress.name);

const useDeprecatedProps = (props) => {
  const {
    callbackOnFetch,
    filterInput,
    googleMapsApiKey,
    handleSuggestionSelection,
    mapModule,
    placeFields,
    searchOptions,
  } = props;

  useEffect(() => {
    if (!googleMapsApiKey && !mapModule) {
      throw new Error(
        'AutocompleteAddress: "googleMapsApiKey" or "mapModule" prop needs to be present.'
      );
    }

    if (callbackOnFetch) {
      deprecationWarning("callbackOnFetch", "onUpdate");
    }

    if (filterInput) {
      deprecationWarning("filterInput");
    }

    if (googleMapsApiKey) {
      deprecationWarning("googleMapsApiKey", "mapModule");
    }

    if (handleSuggestionSelection) {
      deprecationWarning("handleSuggestionSelection", "onUpdate");
    }

    if (placeFields) {
      deprecationWarning("placeFields", "mapModule");
    }

    if (searchOptions) {
      deprecationWarning("searchOptions", "mapModule");
    }
  }, []);

  const deprecatedProps = {
    ...props,
  };

  if (Array.isArray(placeFields)) {
    const normalizedPlaceFields = placeFields.reduce((acc, [part, type]) => {
      acc[part] = type;
      return acc;
    }, {});

    deprecatedProps.placeFields = normalizedPlaceFields;
  }

  return deprecatedProps;
};

const CompatibilityLayer = (props) => {
  const deprecatedProps = useDeprecatedProps(props);
  const {
    filterInput,
    googleMapsApiKey,
    handleSuggestionSelection,
    onUpdate,
    placeFields,
    searchOptions,
    ...otherProps
  } = deprecatedProps;

  const moduleOptions = {
    ...(placeFields && { placeFields }),
    ...(searchOptions && { searchOptions }),
  };
  const googleModule = useMemo(
    () =>
      googleMapsApiKey
        ? new GoogleMapsModule(googleMapsApiKey, moduleOptions)
        : null,
    [googleMapsApiKey, placeFields]
  );

  const customOnUpdate = useCallback(
    (action) => {
      if (action.type === "suggestions_select" && handleSuggestionSelection) {
        googleModule.geocode(action.payload.place_id).then((parts) => {
          const suggestion = {
            ...action.payload,
            parts,
          };

          const filteredSuggestion = filterInput
            ? filterInput(suggestion)
            : googleModule.getSuggestionLabel(suggestion);

          handleSuggestionSelection(filteredSuggestion);
        });
      }

      // Rethrow onUpdate action
      if (onUpdate) {
        onUpdate(action);
      }
    },
    [filterInput, googleModule, handleSuggestionSelection, onUpdate]
  );

  // Components with 'mapModule' provided will ignore other deprecated values.
  return deprecatedProps.mapModule ? (
    <AutocompleteAddress {...deprecatedProps} />
  ) : (
    <AutocompleteAddress
      {...otherProps}
      mapModule={googleModule}
      onUpdate={customOnUpdate}
    />
  );
};

CompatibilityLayer.propTypes = {
  ...AutocompleteAddress.propTypes,
  filterInput: PropTypes.func,
  googleMapsApiKey: PropTypes.string,
  placeFields: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.array),
    PropTypes.object,
  ]),
  searchOptions: PropTypes.object,
};

CompatibilityLayer.defaultProps = {
  ...AutocompleteAddress.defaultProps,
};

export default CompatibilityLayer;

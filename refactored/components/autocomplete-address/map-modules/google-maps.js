import scriptLoader from '../../../utils/script-loader';

// https://developers.google.com/maps/documentation/javascript/geocoding
export const googleMapsBaseUrl = 'https://maps.googleapis.com/maps/api/js';
export const defaultOptions = {
  placeFields: {
    // https://developers.google.com/maps/documentation/javascript/geocoding#GeocodingAddressTypes
    street_number: 'long_name',
    route: 'long_name',
    locality: 'long_name',
    postal_town: 'long_name',
    administrative_area_level_1: 'long_name',
    postal_code: 'long_name',
    country: 'short_name',
  },
  searchOptions: {},
};

class GoogleMapsModule {
  constructor(accessToken, options) {
    if (!accessToken) {
      throw new Error('GoogleMapsModule(constructor): Access token must be provided.');
    }

    this.accessToken = accessToken;
    this.options = {
      ...defaultOptions,
      ...options,
    };

    scriptLoader([
      {
        id: 'googleMapsApi',
        url: GoogleMapsModule.getGoogleMapsApiUrl(accessToken),
        callback: this.privateInitAutocomplete.bind(this),
      },
    ]);
  }

  static formatSearchResult(searchResult) {
    return searchResult;
  }

  static getGoogleMapsApiUrl(key) {
    return `${googleMapsBaseUrl}?libraries=places&key=${key}`;
  }

  static getSuggestionLabel(suggestion) {
    return suggestion.description;
  }

  privateFormatAddressComponents(addressComponents) {
    return Object.entries(this.options.placeFields).reduce((acc, [type, name]) => {
      const addressComponent = addressComponents.find(({ types }) => types.includes(type)) || {};
      acc[type] = addressComponent[name];
      return acc;
    }, {});
  }

  async privateGeocodeRequest(placeId) {
    return new Promise((resolve, reject) => {
      this.geocoder.geocode({ placeId }, (results, status) => {
        if (status !== this.geocoderStatusOK) {
          reject(status);
          return;
        }
        resolve(results);
      });
    });
  }

  privateInitAutocomplete() {
    if (!window.google || !window.google.maps.places) {
      return;
    }

    this.autocompleteService = new window.google.maps.places.AutocompleteService();
    this.geocoder = new window.google.maps.Geocoder();

    this.autocompleteServiceStatusOK = window.google.maps.places.PlacesServiceStatus.OK;
    this.geocoderStatusOK = window.google.maps.GeocoderStatus.OK;
  }

  async privateSearchRequest(text) {
    return new Promise((resolve, reject) => {
      this.autocompleteService.getPlacePredictions(
        { ...this.options.searchOptions, input: text },
        (suggestions, status) => {
          if (status !== this.autocompleteServiceStatusOK) {
            reject(status);
            return;
          }
          resolve(suggestions);
        }
      );
    });
  }

  formatSearchResult = GoogleMapsModule.formatSearchResult;

  getSuggestionLabel = GoogleMapsModule.getSuggestionLabel;

  async geocode(placeId, applyAddressComponentsFormatting = true) {
    const geocodeRes = await this.privateGeocodeRequest(placeId).catch(status => {
      throw new Error(
        `GoogleMapsModule(geocode): Could not process geocoding request. STATUS: "${status}"\nDocs: https://developers.google.com/maps/documentation/javascript/reference/geocoder#GeocoderStatus`
      );
    });

    return applyAddressComponentsFormatting
      ? this.privateFormatAddressComponents(geocodeRes[0].address_components)
      : geocodeRes;
  }

  async search(text) {
    const cleanedText = text.trim();

    if (!cleanedText) {
      throw new Error(
        `GoogleMapsModule(search): Must provide a non-empty 'text'(string) value, you provided: "${cleanedText}"`
      );
    }

    return this.privateSearchRequest(text);
  }
}

export default GoogleMapsModule;

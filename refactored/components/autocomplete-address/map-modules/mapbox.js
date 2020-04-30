import axios from 'axios';

// https://docs.mapbox.com/api/search/#forward-geocoding
export const mapboxBaseUrl = 'https://api.mapbox.com/';
export const defaultOptions = {
  autocomplete: true,
  endpoint: 'mapbox.places',
  fuzzyMatch: false,
  limit: 5,
};

class MapboxModule {
  constructor(accessToken, options) {
    if (!accessToken) {
      throw new Error('MapboxModule(constructor): Access token must be provided.');
    }

    this.accessToken = accessToken;
    this.options = {
      ...defaultOptions,
      ...options,
    };
  }

  static formatSearchResult(searchResult) {
    return searchResult.features;
  }

  static getSuggestionLabel(suggestion) {
    return suggestion.place_name;
  }

  async privateSearchRequest(text) {
    const { autocomplete, endpoint, fuzzyMatch, limit } = this.options;
    const response = await axios.get(`/geocoding/v5/${endpoint}/${text}.json`, {
      baseURL: mapboxBaseUrl,
      params: {
        access_token: this.accessToken,
        autocomplete,
        fuzzyMatch,
        limit,
      },
    });

    return response.data;
  }

  formatSearchResult = MapboxModule.formatSearchResult;

  getSuggestionLabel = MapboxModule.getSuggestionLabel;

  async search(text) {
    const cleanedText = text.trim();

    if (!cleanedText) {
      throw new Error(
        `MapboxModule(search): Must provide a non-empty 'text'(string) value, you provided: "${cleanedText}"`
      );
    }

    return this.privateSearchRequest(text);
  }
}

export default MapboxModule;

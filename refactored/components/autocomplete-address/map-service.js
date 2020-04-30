import debounce from 'lodash.debounce';

export const defaultOptions = {
  searchDebounce: 500,
  searchThreshold: 4,
};

class MapService {
  constructor(mapModule, options) {
    if (!mapModule) {
      throw new Error('MapService(constructor): Map module must be provided.');
    }

    this.mapModule = mapModule;
    this.options = {
      ...defaultOptions,
      ...options,
    };

    this.privateDebouncedSearch = debounce(this.privateSearch, this.options.searchDebounce);
  }

  privateSearch(text, cb) {
    const formattedText = text.trim();

    if (!formattedText || formattedText.length < this.options.searchThreshold) {
      cb([]);
      return;
    }

    this.mapModule
      .search(text)
      .then(searchRes => {
        cb(this.mapModule.formatSearchResult(searchRes));
      })
      .catch(e => {
        console.error(`MapService: ${e}`);
        cb([]);
      });
  }

  getSuggestionLabel(suggestion) {
    return this.mapModule.getSuggestionLabel(suggestion);
  }

  async search(text) {
    return new Promise(resolve => {
      this.privateDebouncedSearch(text, resolve);
    });
  }
}

export default MapService;

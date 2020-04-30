import deprecationWarning from './deprecation-warning';

describe('Deprecation warning', () => {
  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Logs warning to console without replacement', () => {
    const expected = '[Deprecation] Context name: Property "propertyName" is deprecated.';

    deprecationWarning('Context name')('propertyName');

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(expected);
  });

  it('Logs warning to console with replacement', () => {
    const expected =
      '[Deprecation] Context name: Property "propertyName" is deprecated, please use "replacementProperty" instead.';

    deprecationWarning('Context name')('propertyName', 'replacementProperty');

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(expected);
  });
});

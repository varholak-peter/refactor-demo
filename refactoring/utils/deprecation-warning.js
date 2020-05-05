const deprecationWarning = contextName => (propertyName, replacementProperty) => {
  const replacementPart = replacementProperty
    ? `, please use "${replacementProperty}" instead`
    : '';
  const warning = `[Deprecation] ${contextName}: Property "${propertyName}" is deprecated${replacementPart}.`;

  console.warn(warning);
};

export default deprecationWarning;

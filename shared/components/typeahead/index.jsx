import React from "react";
import PropTypes from "prop-types";

import { TextInput } from "../text-input";

const propTypes = {
  items: PropTypes.arrayOf(PropTypes.string),
  onSelect: PropTypes.func,
};

const filterItems = (items, value = "") => {
  if (!value.trim()) {
    return items;
  }

  return items.filter((item) =>
    item.toLowerCase().startsWith(value.toLowerCase())
  );
};

export const Typeahead = ({
  items = [],
  onBlur,
  onChange,
  onFocus,
  onSelect = () => {},
  ...otherProps
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const onBlurCallback = React.useCallback((e) => {
    setTimeout(() => {
      setIsOpen(false);
    }, 200);

    if (onBlur) {
      onBlur(e);
    }
  });

  const onChangeCallback = React.useCallback((e) => {
    setIsOpen(true);

    if (onChange) {
      onChange(e);
    }
  });

  const onFocusCallback = React.useCallback((e) => {
    setIsOpen(true);

    if (onFocus) {
      onFocus(e);
    }
  });

  return (
    <div>
      <TextInput
        type="text"
        onBlur={onBlurCallback}
        onChange={onChangeCallback}
        onFocus={onFocusCallback}
        {...otherProps}
      />
      <br />
      {isOpen ? (
        <ul>
          {filterItems(items, otherProps.value).map((item) => (
            <li key={item} onClick={() => onSelect(item)}>
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

Typeahead.propTypes = propTypes;

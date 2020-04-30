import React from "react";

export const TextInput = ({ label, ...otherProps }) => (
  <label>
    {label}
    <input {...otherProps} />
  </label>
);

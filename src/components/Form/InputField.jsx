import React from 'react';
import { TextField } from '@mui/material';

const InputField = ({ label, value, onChange, onBlur, error, helperText, name, type }) => (
  <TextField
    label={label}
    onBlur={onBlur}
    onChange={onChange}
    value={value}
    name={name}
    type={type}
    error={error}
    helperText={helperText}
    sx={{ gridColumn: "span 4" }}
  />
);

export default InputField;

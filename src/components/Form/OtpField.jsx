import React from 'react';
import { TextField, Typography } from '@mui/material';

const OtpField = ({ values, handleBlur, handleChange, touched, error, otpClick, palette }) => (
  <>
    {!error && !otpClick && (
      <TextField
        label="Enter your Otp"
        type="text"
        onBlur={handleBlur}
        onChange={handleChange}
        value={values.otp}
        name="otp"
        error={Boolean(touched.otp) && otpClick && (!values.otp || values.otp.length !== 4)}
        helperText={values.otp && values.otp.length !== 4 ? "Otp must be exactly 4 characters" : null}
        sx={{ gridColumn: "span 4" }}
      />
    )}
    {!error && !otpClick && (
      <Typography
        fontWeight="400"
        variant="h5"
        sx={{
          width: "20rem",
          color: palette?.primary?.main,
          mt: "-1.3rem",
          ml: "0.4rem",
        }}
      >
        Check your e-mail and enter the otp
      </Typography>
    )}
  </>
);

export default OtpField;

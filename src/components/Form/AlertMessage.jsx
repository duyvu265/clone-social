import React from 'react';
import { Box, Collapse, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const AlertMessage = ({ error, setError }) => (
  <Box sx={{ width: "100%", pt: "2%" }}>
    <Collapse in={error}>
      <Alert
        severity="error"
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => setError(false)}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{ fontSize: "0.95rem" }}
      >
        {error}
      </Alert>
    </Collapse>
  </Box>
);

export default AlertMessage;

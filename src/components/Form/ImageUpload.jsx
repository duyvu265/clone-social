import React from 'react';
import { Box, Typography } from '@mui/material';
import Dropzone from 'react-dropzone';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FlexBetween from 'components/UI/FlexBetween';

const ImageUpload = ({ setFieldValue, values, palette, setImage }) => (
  <Box
    gridColumn="span 4"
    border={`1px solid ${palette.neutral.medium}`}
    borderRadius="5px"
    p="1rem"
  >
    <Dropzone
      accept={{ "image/png": [".png"], "image/jpg": [".jpg"], "image/jpeg": [".jpeg"], "image/.jfif":[".jfif"]}}
      multiple={false}
      onDrop={(acceptedFiles) => {
        setFieldValue("picture", acceptedFiles[0]);
        setImage(acceptedFiles[0]);
      }}
    >
      {({ getRootProps, getInputProps }) => (
        <Box
          {...getRootProps()}
          border={`2px dashed ${palette.primary.main}`}
          p="1rem"
          sx={{ "&:hover": { cursor: "pointer" } }}
        >
          <input {...getInputProps()} />
          {!values.picture ? (
            <p>Add Picture Here</p>
          ) : (
            <FlexBetween>
              <Typography>{values.picture.name}</Typography>
              <EditOutlinedIcon />
            </FlexBetween>
          )}
        </Box>
      )}
    </Dropzone>
  </Box>
);

export default ImageUpload;



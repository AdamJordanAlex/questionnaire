import React, { useEffect } from 'react';
import { at } from 'lodash';
import { useField,useFormikContext } from 'formik';
import { TextField, Tooltip, InputAdornment } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function InputField(props) {
  const {
    infoText,
    startAdornmentText,
    endAdornmentText,
    readOnly,
    type,
    ...rest
  } = props;
  const [field, meta] = useField(props);
  const { validateForm } = useFormikContext();

  let startAdornment = undefined;
  if (startAdornmentText) {
    startAdornment = (
      <InputAdornment position="start">{startAdornmentText}</InputAdornment>
    );
  }
  let endAdornment = undefined;
  if (endAdornmentText) {
    endAdornment = (
      <InputAdornment position="end">{endAdornmentText}</InputAdornment>
    );
  }
  if (infoText) {
    endAdornment = (
      <Tooltip title={infoText}>
        <InfoOutlinedIcon />
      </Tooltip>
    );
  }

  useEffect(() => {
    validateForm(); //we need to revalidate onMount
  }, []);

  function _renderHelperText() {
    const [touched, error] = at(meta, 'touched', 'error');
    if (touched && error) {
      return error;
    }
  }
  return (
    <TextField
      type={type||"text"}
      error={meta.touched && meta.error}
      helperText={_renderHelperText()}
      //disabled={isDisabled}
      InputProps={{
        readOnly: readOnly,
        endAdornment: endAdornment,
        startAdornment: startAdornment,
      }}
      style={{ 'border': 'none' }}
      {...field}
      {...rest}
    />
  );
}

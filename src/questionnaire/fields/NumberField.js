/* eslint-disable indent */
import React, { useEffect } from 'react';
import { at } from 'lodash';
import { useField, useFormikContext } from 'formik';
import { TextField, Tooltip, InputAdornment } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NumberFormat from 'react-number-format';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  input: {
    flex: 1,
    '&::placeholder': {
      color: '#ccc !important'
    }
  },
});

export default function InputField(props) {
  const { errorText, isDisabled, readOnly, infoText, startAdornmentText, endAdornmentText, thousandSeparator, isPhoneNumber, decimalScale, ...rest } = props;
  const [field, meta] = useField(props);
  const { handleBlur, setFieldValue,validateForm } = useFormikContext();

  const classes = useStyles();

  let startAdornment = undefined;
  if (startAdornmentText) {
    startAdornment = <InputAdornment position="start" >{startAdornmentText}</InputAdornment >;
  }
  let endAdornment = undefined;
  if (endAdornmentText) {
    endAdornment = <InputAdornment position="end" >{endAdornmentText}</InputAdornment >;
  }
  if (infoText) {
    endAdornment = (
      <Tooltip title={infoText}>
        < InfoOutlinedIcon />
      </Tooltip>);
  }

  function _renderHelperText() {
    const [touched, error] = at(meta, 'touched', 'error');
    if (touched && error) {
      return error;
    }
  }

  useEffect(() => {
    validateForm(); //we need to revalidate onMount
  }, []);


  return (
    <NumberFormat
      type="text"
      customInput={TextField}
      InputProps={{
        readOnly: readOnly,
        endAdornment: endAdornment,
        startAdornment: startAdornment,
        classes: { input: classes.input }
      }}
      //className={classes.textField}
      decimalScale={decimalScale ? decimalScale : 0}
      fixedDecimalScale={true}
      thousandSeparator={thousandSeparator}
      format={isPhoneNumber ? '(###) ###-####' : undefined}
      mask="_"
      onBlur={handleBlur}
      error={!!(meta.touched && meta.error)}
      helperText={_renderHelperText()}
      {...field}
      {...rest}
      // custom onChange to remove commas
      onChange={e => {
        let newValue = e.target.value.toString().replace(/[^0-9.]/g, '');
        setFieldValue(field.name, newValue);
      }
      }
    />
  );
}

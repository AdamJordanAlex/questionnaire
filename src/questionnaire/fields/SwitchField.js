import React from 'react';
import {FormGroup,FormControlLabel,Switch} from '@mui/material';
import { useFormikContext, Field } from 'formik';

export default function SwitchLabels(props) {
  const { name: fieldName,label,placement="start", defaultChecked=false, ...rest} = props;
  const { setFieldValue } = useFormikContext();

  const handleChange = (event) => {
    //console.log("value",event.target.checked);
    setFieldValue(
      fieldName, event.target.checked
    );
  };

  return (
    <Field name={fieldName}  >
      
      {({
        field, // { name, value, onChange, onBlur }
      }) => (
        <FormGroup row {...rest}>
          <FormControlLabel
            control={
              <Switch
                defaultChecked={defaultChecked}
                onClick={handleChange}
                color="primary"
                {...field}
              />
            }
            label={label}
            labelPlacement={placement}
          />
        </FormGroup>
      )}
    </Field>
  );
}
import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useFormikContext, Field } from 'formik';

export default function ToggleButtons(props) {
  const { choices, exclusive, name: fieldName } = props;
  //const [view, setView] = React.useState(['list']);
  const { setFieldValue } = useFormikContext();

  const handleChange = (value) => {
    setFieldValue(
      fieldName, value
    );
  };

  return (
    < Field name={fieldName} >
      {({
        field, // { name, value, onChange, onBlur }
      }) => (
        <ToggleButtonGroup
          {...field}
          orientation="vertical"
          value={field.value}
          exclusive={exclusive}
          fullWidth
          name={fieldName+'_group'}
          onChange={(e, value) => handleChange(value)}>
          {choices.map((choice, i) => (
            <ToggleButton
              key={i}
              name={fieldName+'_button_'+i}
              style={{
                padding: '20px',
                backgroundColor: field.value?.includes(choice.value) ? null : 'rgba(255, 255, 255, 0.4)'
              }}
              color='primary'
              value={choice.value}
              aria-label="list">
              {choice.label}
            </ToggleButton>
          ))
          }
        </ToggleButtonGroup >
      )}
    </Field>
  );
}

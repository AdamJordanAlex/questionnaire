import React from 'react';
import {Checkbox,InputLabel,ListItemIcon,ListItemText,MenuItem,FormControl,Select  } from '@mui/material';
import { Field } from 'formik';
//import { MenuProps } from './styles';

const MultiSelectDropdownField = (props) => {
  const { name: fieldName, choices, setSelected, selected } = props;

  const handleChange = (event) => {
    const value = event.target.value;
    setSelected(value);
  };

  function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  }

  return (
    <>
      <Field name={fieldName}>
        {({
          field, // { name, value, onChange, onBlur }
        }) => (
          <FormControl
            fullWidth
            variant="standard">
            <InputLabel id="mutiple-select-label" >Other</InputLabel>
            <Select
              color='primary'
              labelId="mutiple-select-label"
              multiple
              value={selected}
              onChange={handleChange}
              // Render the value in the Select field in proper title case
              renderValue={(selected) => {
                let formattedSelected = selected.map((choice) => {
                  let newChoice = choice.replace('_', ' ');
                  newChoice = toTitleCase(newChoice);
                  return newChoice;
                });
                return formattedSelected.join(', ');
              }}
             // MenuProps={MenuProps}
            >
              {choices.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <ListItemIcon>
                    <Checkbox checked={selected.indexOf(option.value) > -1} />
                  </ListItemIcon>
                  <ListItemText primary={option.label} key={option.value}/>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Field>
    </>
  );
};

export default MultiSelectDropdownField;

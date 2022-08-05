import { useEffect, useState } from 'react';
import { Button,Grid } from '@mui/material';
import { useFormikContext, Field } from 'formik';
import MultiSelectDropdownField from './MultiSelectDropdownField';
import HomeIcon from '@mui/icons-material/Home';
import HotelIcon from '@mui/icons-material/Hotel';
import TrainIcon from '@mui/icons-material/Train';
import ComputerIcon from '@mui/icons-material/Computer';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
let buttonSelections = {};

const available_icons={
  'MULTIFAMILY': <HomeIcon />,
  'HOSPITALITY' : <HotelIcon />,
  'INDUSTRIAL' : <TrainIcon /> ,
  'OFFICE' : <ComputerIcon /> ,
  'RETAIL': <ShoppingCartIcon />,
  'HEALTH_CARE': <LocalHospitalIcon />
}

const MultiSelectButtonsField = (props) => {
  const { name: fieldName, choices, otherChoices,icons=false } = props;
  const [otherSelections, setOtherSelections] = useState([]);
  const { setFieldValue } = useFormikContext();

  // Converts buttonSelections to a list, joins with other selections, update Formik
  const updateFieldValues = () => {
    const buttonSelectionsList = Object
      .keys(buttonSelections)
      .filter(k => buttonSelections[k]);
    setFieldValue(
      fieldName, buttonSelectionsList.concat(otherSelections)
    );
  };

  // Toggle button selection
  const _onChange = (name, value) => {
    buttonSelections[name] = !value;
    updateFieldValues();
  };

  // When the values change in the "Other" dropdown, update the field
  useEffect(() => {
    updateFieldValues();
  }, [otherSelections]);

  return (
    <Grid container spacing={2} direction="row"
      justifyContent="center"
      alignItems="center">
      {choices.map((choice, i) => (
        <Grid
          item
          key={i}
          xs={12}
          sm={6}>
          <Field name={fieldName}>
            {({
              field, // { name, value, onChange, onBlur }
            }) => (
              <Button
                fullWidth
                onClick={(e) => {
                  _onChange(choice.value, e.target.value?.includes(choice.value));
                }}
                style={{
                  padding: '20px',
                  backgroundColor: field.value?.includes(choice.value) ? null : 'rgba(255, 255, 255, 0.4)'
                }}
                color='primary'
                variant={field.value?.includes(choice.value) ? 'contained' : 'outlined'}
                //value={field.value.includes(choice.name)}
                {...field}
                startIcon={icons?available_icons[choice.value]:null}>
                {choice.label}
              </Button>
            )}
          </Field>
        </Grid>
      ))}
      <Grid
        item
        xs={12} sm={6}>
        {otherChoices && otherSelections !== undefined &&
          <MultiSelectDropdownField
            name={fieldName}
            setSelected={setOtherSelections}
            selected={otherSelections}
            choices={otherChoices} />}
      </Grid>
    </Grid>
  );
};

export default MultiSelectButtonsField;

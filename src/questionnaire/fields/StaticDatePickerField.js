import * as React from 'react';
import {LocalizationProvider,CalendarPicker} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { Paper } from '@mui/material';
import { useFormikContext, Field } from 'formik';

const currentDate = new Date();
const minDate = currentDate - 30;
const maxDate = currentDate.setFullYear(currentDate.getFullYear() + 2);

export default function StaticDatePickerField(props) {
  const { setFieldValue } = useFormikContext();
  const { name: fieldName } = props;
  const _onChange = (e) => {
    setFieldValue(
      fieldName, e
    );
  };

  return (
    <Paper style={{
      display: 'inline-block',
      boxShadow: '15px 15px 25px rgba(0, 0, 0, 0.1)'
    }}>
      < LocalizationProvider dateAdapter={AdapterDateFns}>
        <Field name={fieldName}>
          {({
            field, // { name, value, onChange, onBlur }
          }) => (
            <CalendarPicker
              style={{ margin: '0px' }}
              {...field}
              date={field.value}
              minDate={minDate}
              maxDate={maxDate}
              onChange={_onChange} />
          )}
        </Field>
      </LocalizationProvider>
    </Paper >
  );
}
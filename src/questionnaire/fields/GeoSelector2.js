import * as React from 'react';
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Button, Typography, Grid, Autocomplete, Box, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, CircularProgress, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import throttle from 'lodash/throttle';
import { getPredictions } from '../../api/API';
import { useFormikContext, Field } from 'formik';
import MyMapComponent from './MyMapComponent';
import './map.css';


export default function GeoSelector2(props) {
  const { name: fieldName, label } = props;
  const [inputValue, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState([]);
  const { setFieldValue } = useFormikContext();
  const [loading, setLoading] = React.useState(false);
  const [mapOpen, setMapOpen] = React.useState(false);



  const fetch = React.useMemo(
    () =>
      throttle((search, callback) => {
        setLoading(true);
        if (search.length < 3) {
          setLoading(false);
          callback([]);
        }
        else getPredictions(search).then(results => {
          //console.log("RESULTS",results.places);
          callback(results);
          setLoading(false);
        });
      }, 200),
    [],
  );

  React.useEffect(() => {
    let active = true;
    if (inputValue === '') {
      setOptions([]);
      return undefined;
    }
    fetch(inputValue, (results) => {
      if (active) {

        setOptions(processResults(results));
      }
    });

    return () => {
      active = false;
    };
  }, [inputValue, fetch]);

  const processResults = (data) => {

    let states = {};
    data.places?.forEach(place => {
      //if (place.state_obj.id!=place.county?.state_obj?.id) console.log("??  "+place.state_obj.id+"!="+place.county.state_obj.id)
      if (!place.state_obj) place.state_obj = { name: "OTHER", code: "0",type:"" };
      if (!place.county) place.county = { name: "OTHER", county_fips: "0",type:"" };
      if (!place.county.msa) place.county.msa = { name: "OTHER", code: "0",type:"" };
      if (!states[place.state_obj.code]) states[place.state_obj.code] = { name: place.state_obj.name, id: place.state_obj.id || place.state_obj.objectId, msas: {}, boundaries:place.state_obj.boundaries };
      if (!states[place.state_obj.code].msas[place.county.msa.code]) states[place.state_obj.code].msas[place.county.msa.code] = { name: place.county.msa.name + (place.county.msa.type != 'Non-MSA' ? (" " + place.county.msa.type) : ""), id: place.county.msa.id || place.county.msa.objectId, counties: {},boundaries: place.county.msa.boundaries };
      if (!states[place.state_obj.code].msas[place.county.msa.code].counties[place.county.county_fips]) states[place.state_obj.code].msas[place.county.msa.code].counties[place.county.county_fips] = { name: place.county.name + " " + place.county.type, id: place.county.id || place.county.objectId, places: [],boundaries:place.county.boundaries };
      states[place.state_obj.code].msas[place.county.msa.code].counties[place.county.county_fips].places.push(place);
    });
    data.states?.forEach(state => {
      if (!states[state.code]) states[state.code] = { name: state.name, msas: {}, id: state.id, msas: {},boundaries:state.boundaries };
    });
    //TODO sort states
    let result = [];
    Object.keys(states).forEach(i => {
      result.push({ type: 'state', name: states[i].name, id: states[i].id,boundaries:states[i].boundaries });
      let msas = states[i].msas;
      Object.keys(msas).forEach(j => {
        if (msas[j].name !== "OTHER ") result.push({ type: 'msa', name: msas[j].name, id: msas[j].id,boundaries:msas[j].boundaries,parent_id: states[i].id});
        let counties = msas[j].counties;
        Object.keys(counties).forEach(k => {
          if (counties[k].name !== "OTHER ") result.push({ type: 'county', name: counties[k].name, id: counties[k].id,boundaries:counties[k].boundaries,parent_id:msas[j].id });
          counties[k].places.forEach(place => {
            result.push({ type: 'place', name: place.name, id: place.id || place.objectId,boundaries:place.boundaries,parent_id:counties[k].id });
          })
        });
      });
    });
    //console.log(states);
    return result;
  }

  const renderOption = (props, option) => {
    props.key = props["data-option-index"];
    switch (option.type) {
      case 'state':
        return <li {...props} >
          <Box sx={{ fontWeight: 'bold' }}>
            {option.name}
          </Box>
        </li>
      case 'msa':
        return <li {...props}>
          <Box sx={{ ml: 2, fontStyle: 'italic' }}>
            {option.name}
          </Box>
        </li>
      case 'county':
        return <li {...props}>
          <Box sx={{ ml: 4 }}>
            - {option.name}
          </Box>
        </li>
      case 'place':
        return <li {...props}>
          <Grid container alignItems="center" sx={{ ml: 5 }}  >
            <Grid item>
              <Box
                component={LocationOnIcon}
                sx={{ color: 'text.secondary', mr: 2 }}
              />
            </Grid>
            <Grid item xs>
              <span>{option.name}</span>
              <Typography variant="body2" color="text.secondary">
                {option.description}
              </Typography>
            </Grid>
          </Grid>
        </li>
    }
  }

  const getOptionsText = () => {
    if (loading) return 'Loading...';
    if (inputValue.length == 0) return "Start typing the name...";
    if (inputValue.length < 3) return "Continue typing..."
    return "No options";
  }
  const renderWrapperStatus = (wstatus) => {
    if (wstatus === Status.FAILURE) return <Alert color="error">Error loading Google maps</Alert>
    return <Box sx={{ p: 2, textAlign: "center" }}><CircularProgress /></Box>
  };

  const setValue=(value)=>{
    setOptions(value? [value, ...options] : options);
    setFieldValue(fieldName, value);
  }

  const getOptionDisabled=(option,values)=>{
    let selected=values.find(value=>(option.id===value.id));
    if (selected) return true;
    if (option.parent_id) return getOptionDisabled(options.find(o=>(o.id===option.parent_id)),values);
    return false;
  }

  return (
    <Field name={fieldName}>
      {({
        field, // { name, value, onChange, onBlur }
      }) => (
        <>
          <Autocomplete
            id="google-map"
            //freeSolo
            getOptionLabel={(option) => (option.name || "")}
            label=""
            multiple
            fullWidth
            filterOptions={(x) => x}
            options={options}
            autoComplete
            //includeInputInList
            //filterSelectedOptions
            value={field.value}
            noOptionsText={getOptionsText()}
            isOptionEqualToValue={(option, value) => (option?.id === value?.id && option?.type === value?.type)} /*TODO show as choosed if parent choosed */
            onChange={(event, newValue) => {
              setValue(newValue);
            }}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label={label} fullWidth />
            )}
            renderOption={renderOption}
            getOptionDisabled={(option)=>getOptionDisabled(option,field.value)}
          />
          {/*<Box sx={{ textAlign: "right" }}>
            <Button size="small" onClick={()=>{setMapOpen(true)}} >Choose on map</Button>
            </Box>*/}
          <Dialog
            open={mapOpen}
            onClose={()=>{setMapOpen(false)}}
            PaperProps={{
              style: {
                minWidth: '80%',
                minHeight: '300px',
                maxWidth: '1000px',
              },
            }}>
            <DialogTitle>
              Choose locations
              <IconButton
                aria-label="close"
                onClick={()=>{setMapOpen(false)}}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                }}
              ><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent>
              <Box style={{
                position: "relative",
                minHeight: '300px',
                '&::before': {
                  content: '"Loading map ...."',
                  color: "#666262",
                  top: '100px',
                  position: "absolute",
                  width: "100%",
                  textAlign: "center"
                }
              }}>
                <Wrapper apiKey={process.env.REACT_APP_GOOGLE_MAP_API_KEY} render={renderWrapperStatus} libraries={['drawing','geometry']}>
                  <MyMapComponent value={field.value} setValue={setValue} />
                </Wrapper>
              </Box>
            </DialogContent>
            <DialogActions sx={{ pr: 3, pb: 2 }}>
              <Button color="primary" variant={"outlined"} autoFocus onClick={()=>{setMapOpen(false)}}>
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Field>
  );
}

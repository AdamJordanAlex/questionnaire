import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { Alert, Autocomplete, CircularProgress, TextField } from '@mui/material';
import { useRef, useEffect, useState } from "react";
import { useFormikContext, useField } from 'formik';
import { getCounties, getIPinfo } from "../../api/API";

var map;
var selectedCounties = [];

const MyMapComponent = (props) => {
    const { selected, setSelected, counties} = props;
    const ref = useRef();
    

    const chooseCounty = (event) => {
        let county = counties[event.featureData?.id];
        if (!county) {
            console.log("Can't find county " + event.featureData?.id + ' in', counties);
            return;
        }
        const infowindow = new window.google.maps.InfoWindow({ content: "<span style='font-size:0.9em;'>" + county.name + " " + county.type + ", " + county.state + "</span>" });
        infowindow.setPosition(event.latLng);
        infowindow.open(map);

        let polygons = [];
        county.boundaries.forEach(boundary => {
            const polygon = new window.google.maps.Polygon({
                paths: boundary,
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#FF0000",
                fillOpacity: 0.35,
            });
            polygons.push(polygon);
            polygon.addListener('click', (event) => {
                removeCounty(county, polygons, infowindow);
            });
            polygon.setMap(map);
        });

        infowindow.addListener('closeclick', (event) => {
            removeCounty(county, polygons);
        });
        selectedCounties.push({ id: county.objectId, value: county, label: county.name + " "+county.type+ ", " + county.state, infowindow, polygons });
        setSelected(selectedCounties);
    }

    const removeCounty = (county, polygons, infowindow) => {
        removeManyCounties([{county, polygons, infowindow}]);
    }

    const removeManyCounties = (data) => {
        data.forEach(el=>{
            let {county,polygons,infowindow} = el;
            polygons?.forEach(polygon => {
                polygon.setMap(null);
            })
            infowindow?.setMap(null);
            let remove = selectedCounties.findIndex(val => val.id === county.objectId);
            if (remove !== -1) 
                selectedCounties.splice(remove, 1);
        });
        setSelected(selectedCounties);
    }

    const onValueChanged = () => {
        var added=0;
        var counties_to_remove=[];
        selectedCounties.forEach(el => {
            if (selected.findIndex(val => val.id === el.id) < 0) {
                counties_to_remove.push({county:el.value,polygons:el.polygons,infowindow:el.infowindow});
            } 
        });
        removeManyCounties(counties_to_remove);
        selected?.forEach(el => {
            if (selectedCounties.findIndex(val => val.id === el.id) < 0) {
                //console.log("selecting " + el.id + " from ", selectedCounties);
                chooseCounty({ featureData: { id: el.value.kml_id },latLng:getCountyCenter(el.value) });
                added++;
            }
        });
        if (added){
            var bounds = new window.google.maps.LatLngBounds();
            selectedCounties.forEach(el => {
                el.value.boundaries.forEach(bnds => {
                    bnds.forEach(coords=>{
                        bounds.extend(coords);
                    });                        
                });
            });
            map.fitBounds(bounds);
        }

    }
    const getCountyCenter = (county) =>{
        var lat={min:90,max:-90};
        var lng={min:180,max:-180};
        county.boundaries?.forEach(bnds => {
            bnds.forEach(coords=>{
                if (coords.lat<lat.min) lat.min=coords.lat;
                if (coords.lat>lat.max) lat.max=coords.lat;
                if (coords.lng<lng.min) lng.min=coords.lng;
                if (coords.lng>lng.max) lng.max=coords.lng;
            });
        });
        //console.log(lat,lng,{lat:lat.min+(lat.max-lat.min)/2,lng:lng.min+(lng.max-lng.min)/2});
        return {lat:lat.min+(lat.max-lat.min)/2,lng:lng.max>0?lng.min:(lng.min+(lng.max-lng.min)/2)};
    }

    const initMap = async () => {
        const ipdata=await getIPinfo();
        let center={lat:39,lng:-104};
        if (ipdata?.country_code=='US' && ipdata.latitude && ipdata.longitude) center={lat:ipdata.latitude,lng: ipdata.longitude};
        //console.log(ipdata);
        map = new window.google.maps.Map(ref.current, {
            center: center,
            zoom: ipdata?.country_code=='US'?6:3,
            disableDefaultUI: true,
            scaleControl: true,
            zoomControl: true,
        });

        var kmlLayer = new window.google.maps.KmlLayer(process.env.REACT_APP_GOOGLE_KML_PATH, {
            suppressInfoWindows: true,
            preserveViewport: true,
            map: map,
        });
        if (selectedCounties.length>0) {
            selectedCounties.forEach(val=>{
                if (val.infowindow) {
                    val.infowindow.setMap(map);
                    val.polygons?.forEach(polygon=>{polygon.setMap(map)});
                } else {
                    chooseCounty({ featureData: { id: val.value.kml_id },latLng:getCountyCenter(val.value) });
                }
            })
        }
        kmlLayer.addListener('click', chooseCounty);
    }

    useEffect(() => {
        initMap();
    }, [counties]);

    useEffect(() => {
        onValueChanged();
    }, [selected]);



    return <div ref={ref} id="map" style={{ minHeight: '300px' }} />;
}

const CountySelector = (props) => {
    const [field] = useField(props);
    const { name: fieldName, variant = "filled", label = "Location Search",preloaded_counties } = props;
    const [counties, setCounties] = useState(preloaded_counties?.reduce((a, v) => ({ ...a, [v.kml_id]: v }), {}) || {});
    const { setFieldValue, setTouched, errors, touched } = useFormikContext();
    const [isLoading, setLoading] = useState(false);

    const handleChange = (event, newValue) => {
        setSelected(newValue);
    };

    const setSelected = (newValue) => {
        setFieldValue(
            fieldName, newValue
        );
    }

    const _renderHelperText = () => {
        if (touched[props.name] && errors[props.name]) {
            return errors[props.name];
        }
    }

    const loadCounties = async () => {
        setLoading(true);
        try {
            let data = await getCounties();
            let _counties = [];
            data?.forEach(el => {
                _counties[el.kml_id] = el;
            })
            setCounties(_counties);
            //console.log("counties loaded: ");
        } catch (err) {
            console.log("Can't load counties", err)
        }
        setLoading(false);
    }
    useEffect(() => {
        selectedCounties=field.value||[];
        if (!counties || Object.keys(counties).length<1000) {
            console.log("loading counties from db",{...counties})
            loadCounties();
        }
    }, [fieldName]);

    const render = (status) => {
        if (status === Status.FAILURE) return <Alert color="error">Error loading Google maps</Alert>
        return <CircularProgress />;
    };



    return (
        <>
            {isLoading ?
                <CircularProgress />
                :
                <>
                    <Autocomplete
                        options={Object.keys(counties).map(id => ({ id: counties[id].objectId, value: counties[id], label: counties[id].name + " "+counties[id].type+", " + counties[id].state }))}
                        groupBy={(option) => option.value.state}
                        multiple
                        value={field.value}
                        onChange={handleChange}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={label}
                                helperText={_renderHelperText()}
                                error={!!(touched[props.name] && errors[props.name])}
                                variant={variant}
                            />
                        )
                        }
                        sx={{ maxHeight: '6em', overflow: 'auto' }}
                    />
                    <Wrapper apiKey={process.env.REACT_APP_GOOGLE_MAP_API_KEY} render={render}>
                        <MyMapComponent counties={counties} selected={field.value} setSelected={setSelected} />
                    </Wrapper>
                </>
            }
        </>
    )
}

export default CountySelector;
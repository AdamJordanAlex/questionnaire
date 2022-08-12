import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { Alert, Autocomplete, Typography, ListSubheader, useMediaQuery, CircularProgress, TextField, Box, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useRef, useEffect, useState, forwardRef, createContext, useContext, Component } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { getCounties, getIPinfo } from "../../api/API";
import { useTheme } from '@mui/material/styles';
import { makeStyles, withStyles } from '@mui/styles';
import { VariableSizeList } from 'react-window';

const useStyles = makeStyles({
    map_container: {
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
    },
    map: {
        minHeight: '300px',
    }

});

var map;
var selectedCounties = [];

const MyMapComponent = (props) => {
    const { selected, setSelected, counties } = props;
    const ref = useRef();
    const classes = useStyles();

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
        selectedCounties.push({ id: county.objectId, value: county, label: county.name + " " + county.type + ", " + county.state, infowindow, polygons });
        setSelected(selectedCounties);
    }

    const removeCounty = (county, polygons, infowindow) => {
        removeManyCounties([{ county, polygons, infowindow }]);
    }

    const removeManyCounties = (data) => {
        data.forEach(el => {
            let { county, polygons, infowindow } = el;
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
        var added = 0;
        var counties_to_remove = [];
        selectedCounties?.forEach(el => {
            if (selected.findIndex(val => val.id === el.id) < 0) {
                counties_to_remove.push({ county: el.value, polygons: el.polygons, infowindow: el.infowindow });
            }
        });
        removeManyCounties(counties_to_remove);
        console.log(3);
        selected?.forEach(el => {
            if (selectedCounties.findIndex(val => val.id === el.id) < 0) {
                //console.log("selecting " + el.id + " from ", selectedCounties);
                chooseCounty({ featureData: { id: el.value.kml_id }, latLng: getCountyCenter(el.value) });
                added++;
            }
        });
        if (added) {
            var bounds = new window.google.maps.LatLngBounds();
            selectedCounties.forEach(el => {
                el.value.boundaries.forEach(bnds => {
                    bnds.forEach(coords => {
                        bounds.extend(coords);
                    });
                });
            });
            map.fitBounds(bounds);
        }
    }
    const getCountyCenter = (county) => {
        var lat = { min: 90, max: -90 };
        var lng = { min: 180, max: -180 };
        county.boundaries?.forEach(bnds => {
            bnds.forEach(coords => {
                if (coords.lat < lat.min) lat.min = coords.lat;
                if (coords.lat > lat.max) lat.max = coords.lat;
                if (coords.lng < lng.min) lng.min = coords.lng;
                if (coords.lng > lng.max) lng.max = coords.lng;
            });
        });
        //console.log(lat,lng,{lat:lat.min+(lat.max-lat.min)/2,lng:lng.min+(lng.max-lng.min)/2});
        return { lat: lat.min + (lat.max - lat.min) / 2, lng: lng.max > 0 ? lng.min : (lng.min + (lng.max - lng.min) / 2) };
    }

    const initMap = async () => {
        const ipdata = await getIPinfo();
        let center = { lat: 39, lng: -104 };
        if (ipdata?.country_code === 'US' && ipdata.latitude && ipdata.longitude) center = { lat: ipdata.latitude, lng: ipdata.longitude };
        //console.log(ipdata);
        map = new window.google.maps.Map(ref.current, {
            center: center,
            zoom: ipdata?.country_code === 'US' ? 6 : 3,
            disableDefaultUI: true,
            scaleControl: true,
            zoomControl: true,
        });

        var kmlLayer = new window.google.maps.KmlLayer(process.env.REACT_APP_GOOGLE_KML_PATH, {
            suppressInfoWindows: true,
            preserveViewport: true,
            map: map,
        });
        if (selectedCounties?.length > 0) {
            selectedCounties.forEach(val => {
                if (val.infowindow) {
                    val.infowindow.setMap(map);
                    val.polygons?.forEach(polygon => { polygon.setMap(map) });
                } else {
                    chooseCounty({ featureData: { id: val.value.kml_id }, latLng: getCountyCenter(val.value) });
                }
            })
        }
        kmlLayer.addListener('click', chooseCounty);
    }

    useEffect(() => {
        initMap();
    }, [counties]);

    useEffect(() => {
       if (map) onValueChanged();
    }, [selected]);



    return <div ref={ref} id="map" className={classes.map} />;
}


// Adapter for react-window
const ListboxComponent = forwardRef(function ListboxComponent(props, ref) {
    const { children, ...other } = props;
    const itemData = [];
    children.forEach((item) => {
        itemData.push(item);
        itemData.push(...(item.children || []));
    });

    const theme = useTheme();
    const smUp = useMediaQuery(theme.breakpoints.up('sm'), {
        noSsr: true,
    });

    const OuterElementContext = createContext({});

    const OuterElementType = forwardRef((props, ref) => {
        const outerProps = useContext(OuterElementContext);
        return <div ref={ref} {...props} {...outerProps} />;
    });

    const useResetCache = (data) => {
        const ref = useRef(null);
        useEffect(() => {
            if (ref.current != null) {
                ref.current.resetAfterIndex(0, true);
            }
        }, [data]);
        return ref;
    }

    const renderRow = (props) => {
        const { data, index, style } = props;
        const dataSet = data[index];
        const inlineStyle = {
            ...style,
            top: style.top + 8,
        };

        if (dataSet.hasOwnProperty('group')) {
            return (
                <ListSubheader key={dataSet.key} component="div" style={inlineStyle}>
                    {dataSet.group}
                </ListSubheader>
            );
        }

        return (
            <Typography component="li" {...dataSet[0]} noWrap style={inlineStyle}>
                {dataSet[1].label}
            </Typography>
        );
    }

    const itemCount = itemData?.length ||0;
    const itemSize = smUp ? 36 : 48;

    const getChildSize = (child) => {
        if (child.hasOwnProperty('group')) {
            return 48;
        }

        return itemSize;
    };

    const getHeight = () => {
        if (itemCount > 8) {
            return 8 * itemSize;
        }
        return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
    };

    const gridRef = useResetCache(itemCount);

    return (
        <div ref={ref}>
            <OuterElementContext.Provider value={other}>
                <VariableSizeList
                    itemData={itemData}
                    height={getHeight() + 2 * 8}
                    width="100%"
                    ref={gridRef}
                    outerElementType={OuterElementType}
                    innerElementType="ul"
                    itemSize={(index) => getChildSize(itemData[index])}
                    overscanCount={5}
                    itemCount={itemCount}
                >
                    {renderRow}
                </VariableSizeList>
            </OuterElementContext.Provider>
        </div>
    );
});

class CountySelector extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            counties: props.preloaded_counties?.reduce((a, v) => ({ ...a, [v.kml_id]: v }), {}) || {},
            modalOpen: false,
        }
        selectedCounties = props.formref?.current?.values[props.name] || [];
    }

    //TODO load counties if not pre-loaded

    handleChange(event, newValue) {
        //console.log("trying to handle change",newValue);
        this.setSelected(newValue);
    }

    setSelected(newValue) {
        //console.log(this.props.formref?.current?.values[this.props.name]);
        //console.log(this.props.formref?.current);
        this.props.formref?.current?.setFieldValue(
            this.props.name, newValue
        );
    }

    _renderHelperText() {
        if (this.props.formref?.current?.touched[this.props.name] && this.props.formref?.current?.errors[this.props.name]) {
            return this.props.formref?.current?.errors[this.props.name];
        }
    }

    renderWrapperStatus(wstatus) {
        if (wstatus === Status.FAILURE) return <Alert color="error">Error loading Google maps</Alert>
        return <Box sx={{ p: 2, textAlign: "center" }}><CircularProgress /></Box>
    };

    render() {
        return (<>
            {this.isLoading ?
                <Box sx={{ p: 2, textAlign: "center" }}><CircularProgress /></Box>
                :
                <>
                    <Autocomplete
                        options={Object.keys(this.state.counties).map(id => ({ id: this.state.counties[id].objectId, value: this.state.counties[id], label: this.state.counties[id].name + " " + this.state.counties[id].type + ", " + this.state.counties[id].state })) || []}
                        groupBy={(option) => option.value.state}
                        multiple
                        value={this.props.formref?.current?.values[this.props.name] || []}
                        limitTags={3}
                        onChange={this.handleChange.bind(this)}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        disableListWrap
                        renderOption={(props, option) => { return [props, option] }}
                        renderGroup={(params) => params}
                        ListboxComponent={ListboxComponent}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={this.props.label || "Location Search"}
                                helperText={this._renderHelperText()}
                                error={!!(this.props.formref?.current?.touched[this.props.name] && this.props.formref?.current?.errors[this.props.name])}
                                variant={this.props.variant || "filled"}
                            />
                        )
                        }
                        sx={{ maxHeight: '6em', overflow: 'auto' }}
                    />
                    {!this.props.map_modal ?
                        <Box className={this.props.classes.map_container}>
                            <Wrapper apiKey={process.env.REACT_APP_GOOGLE_MAP_API_KEY} render={this.renderWrapperStatus} >
                                <MyMapComponent counties={this.state.counties} selected={this.props?.formref?.current?.values[this.props.name] || []} setSelected={this.setSelected.bind(this)} />
                            </Wrapper>
                        </Box>
                        :
                        <Box sx={{ textAlign: "right" }}>
                            <Button size="small" onClick={() => this.setState({ modalOpen: true })} >Choose on map</Button>
                        </Box>
                    }
                    {this.props.map_modal && 
                        <Dialog
                            open={this.state.modalOpen}
                            onClose={() => { this.setState({ modalOpen: false }) }}
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
                                    onClick={() => { this.setState({ modalOpen: false }) }}
                                    sx={{
                                        position: 'absolute',
                                        right: 8,
                                        top: 8,
                                    }}
                                ><CloseIcon /></IconButton>
                            </DialogTitle>
                            <DialogContent>
                                <Box className={this.props.classes.map_container}>
                                    <Wrapper apiKey={process.env.REACT_APP_GOOGLE_MAP_API_KEY} render={this.renderWrapperStatus} >
                                        <MyMapComponent counties={this.state.counties} selected={this.props?.formref?.current?.values[this.props.name] || []} setSelected={this.setSelected.bind(this)} />
                                    </Wrapper>
                                </Box>
                            </DialogContent>
                            <DialogActions sx={{pr:3,pb:2}}>
                                <Button color="primary" variant={"outlined"} autoFocus onClick={() => { this.setState({ modalOpen: false }) }}>
                                    OK
                                </Button>
                            </DialogActions>
                        </Dialog>

                    }
                </>
            }
        </>)
    }
}

export default withStyles(useStyles)(CountySelector);
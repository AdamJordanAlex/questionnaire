import { useRef, useEffect, useState } from "react";
import { getCountyByCoords, getIPinfo } from "../../api/API";

const MyMapComponent = (props) => {
    const { value, setValue } = props;
    const ref = useRef();
    const markers = useRef([]);
    var map;
    var selected = [...value];

    const initMap = async () => {

        map = new window.google.maps.Map(ref.current, {
            zoom: 3,
            disableDefaultUI: true,
            scaleControl: true,
            zoomControl: true,
            fullscreenControl: true
        });

        if (!selected || selected.length == 0) {
            console.log("Calculating center");
            const ipdata = await getIPinfo();
            console.log(ipdata);
            let center = { lat: 39, lng: -104 };
            if (ipdata?.country_code === 'US' && ipdata.latitude && ipdata.longitude) center = { lat: ipdata.latitude, lng: ipdata.longitude };
            map.setCenter(center);
            map.setZoom(ipdata?.country_code === 'US' ? 6 : 3);
        } else {
            var llbounds = new window.google.maps.LatLngBounds();
            if (selected.length > 0) {
                selected.forEach(element => {
                    drawBoundaries(element, llbounds);
                })
            }
            map.fitBounds(llbounds);
        }

        map.addListener("zoom_changed", function () {
            markers?.current.forEach(marker => {
                var label = marker.getLabel();
                if (map.getZoom() < 4) {
                    label.fontSize = "0px";
                    marker.setLabel(label);
                } else if (map.getZoom() < 8) {
                    label.fontSize = map.getZoom()*1.1 + "px";
                    marker.setLabel(label);
                } else {
                    label.fontSize = map.getZoom() * 1.5 + "px";
                    marker.setLabel(label);
                }
                //console.log("changing label to ", label);
            });
        });
        map.addListener("click", function (e) {
            addElementByCoords(e.latLng.lat(),e.latLng.lng());
            return false;
        });


        const poptions = {
            clickable: true,
            //editable: true,
            zIndex: 1,
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.35,
        }
        const drawingManager = new window.google.maps.drawing.DrawingManager({
            //drawingMode: window.google.maps.drawing.OverlayType.MARKER,
            drawingControl: true,
            drawingControlOptions: {
                position: window.google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [
                   // window.google.maps.drawing.OverlayType.MARKER,
                    window.google.maps.drawing.OverlayType.POLYGON,
                    window.google.maps.drawing.OverlayType.CIRCLE,
                    window.google.maps.drawing.OverlayType.RECTANGLE,
                ],
            },
            markerOptions: {
                icon: "pixel.png",
            },
            circleOptions: poptions,
            rectangleOptions: poptions,
            polygonOptions: poptions
        });
        window.google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event) {
            let el;
            switch (event.type) {
                case 'marker':
                    el = addElementByCoords(event.overlay?.position?.lat(), event.overlay?.position?.lng())
                    event.overlay.setTitle(el.name);
                    break;
                case 'polygon':
                    let bounds = event.overlay?.getPath()?.getArray()?.map(coord => ({ lat: coord.lat(), lng: coord.lng() }));
                    el = addElementByBoundaries(bounds);
                    break;
                case 'rectangle':
                    let rect = event.overlay.getBounds();
                    var start = rect.getNorthEast();
                    var end = rect.getSouthWest();
                    let repath = [{ lat: start.lat(), lng: start.lng() },
                    { lat: end.lat(), lng: start.lng() },
                    { lat: end.lat(), lng: end.lng() },
                    { lat: start.lat(), lng: end.lng() },
                    { lat: start.lat(), lng: start.lng() }
                    ];
                    el = addElementByBoundaries(repath);
                    break;
                case 'circle':
                    let cpath = convertCircleToPoligon(event.overlay.center, event.overlay.radius, 16);
                    el = addElementByBoundaries(cpath);
                    break;
                default:
                    console.log("UNKNOW DRAWTYPE-" + event.type)
            }
            //TODO SHOW NAME
            if (event.type !== 'marker')
                window.google.maps.event.addListener(event.overlay, 'click', function () {
                    removeElement(el, event.overlay);
                });
        });
        drawingManager.setMap(map);
    }

    //TODO SHOW NAME
    const addElementByCoords = async (lat, lng) => {
        let counties = await getCountyByCoords(lat, lng);
        if (counties && counties.length) {
            let el = { type: 'county', name: counties[0].name + " " + counties[0].type, id: counties[0].id || counties[0].objectId, boundaries: counties[0].boundaries };
            let id = counties[0].id || counties[0].objectId
            if (!selected.find(val => (val.id === id))) {
                drawBoundaries(el);
                selected.push(el);
                setValue([...selected]);
                return el;
            } else console.log("Already added " + id);
        }
        return null;
    }

    const addElementByBoundaries = (boundaries) => {
        let el = { type: 'custom', name: "Custom shape", boundaries: [boundaries] };
        selected.push(el);
        setValue([...selected]);
        return el;
    }

    const convertCircleToPoligon = (center, radius, numSides) => {
        var points = [],
            degreeStep = 360 / numSides;

        for (var i = 0; i < numSides; i++) {
            var gpos = window.google.maps.geometry.spherical.computeOffset(center, radius, degreeStep * i);
            points.push({ lat: gpos.lat(), lng: gpos.lng() });
        };
        return points;
    }

    const removeElement = (element, polygon) => {
        polygon.setMap(null);//TODO remove siblings
        let remove = selected.findIndex(val => val.id === element.id);
        if (remove !== -1) {
            selected.splice(remove, 1);
            setValue(selected);
        }
        polygon.siblings?.forEach(pol=>{
            pol.setMap(null);
        })
        if (polygon.marker) {
        polygon.marker.setMap(null);
            let removemarker = markers.current.findIndex(val => val === polygon.marker);
            if (remove !== -1) {
                markers.current.splice(removemarker, 1);
                console.log("markers:",markers.current)
            }
        }
    }

    const drawBoundaries = (element, llbounds) => {
        if (!element?.boundaries) return;
        let currentbounds = new window.google.maps.LatLngBounds();
        let poligons=[];
        element.boundaries.forEach(boundary => {
            const polygon = new window.google.maps.Polygon({
                paths: boundary,
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#FF0000",
                fillOpacity: 0.35,
            });
            //polygons.push(polygon);
            polygon.addListener('click', (event) => {
                removeElement(element, polygon);
            });
            polygon.setMap(map);
            boundary.forEach(coords => {
                currentbounds.extend(coords)
                if (llbounds) llbounds.extend(coords);
            });
            poligons.push(polygon)
        });
        //var image = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2238%22%20height%3D%2238%22%20viewBox%3D%220%200%2038%2038%22%3E%3Cpath%20fill%3D%22%23808080%22%20stroke%3D%22%23ccc%22%20stroke-width%3D%22.5%22%20d%3D%22M34.305%2016.234c0%208.83-15.148%2019.158-15.148%2019.158S3.507%2025.065%203.507%2016.1c0-8.505%206.894-14.304%2015.4-14.304%208.504%200%2015.398%205.933%2015.398%2014.438z%22%2F%3E%3Ctext%20transform%3D%22translate%2819%2018.5%29%22%20fill%3D%22%23fff%22%20style%3D%22font-family%3A%20Arial%2C%20sans-serif%3Bfont-weight%3Abold%3Btext-align%3Acenter%3B%22%20font-size%3D%2212%22%20text-anchor%3D%22middle%22%3E' + "TEST LABEL" + '%3C%2Ftext%3E%3C%2Fsvg%3E';
        let marker = new window.google.maps.Marker({
            position: currentbounds.getCenter(),
            map,
            label: {
                text: element.name,
                color: '#fff',
                fontSize: map.getZoom()*1.2 + 'px',
            },
            title: element.name,
            icon: "pixel.png",
        });
        markers.current.push(marker);
        poligons.forEach(polygon=>{
            polygon.marker=marker;
            polygon.siblings=poligons.filter(p=>(p!==polygon));
        });
    }

    /* const getCountyCenter = (county) => {
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
     }*/

    useEffect(() => {
        console.log("Map init", selected);
        if (!map) initMap();
    }, []);



    return <div ref={ref} id="map" style={{ minHeight: '300px' }} />;
}



export default MyMapComponent;
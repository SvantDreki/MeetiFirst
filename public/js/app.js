import { OpenStreetMapProvider } from 'leaflet-geosearch';
import asistencia from './asistencia';
import eliminarComentario from './eliminarComentario';

const lat = document.querySelector('#lat').value || -35.675147;
const lng = document.querySelector('#lng').value || -71.542969;
const direccion = document.querySelector('#direccion').value || '';

const map = L.map('mapa').setView([lat, lng], 15);
let markers = new L.FeatureGroup().addTo(map);
let marker;

//Utiliza el provider y el geocoder
const geocodeService = L.esri.Geocoding.geocodeService();

//Colocar pin en edicion
if(lat && lng) {
     //agregar el pin
     marker = new L.marker( [lat, lng], {
        draggable: true,
        autoPan: true
    })
    .addTo(map)
    .bindPopup(direccion)
    .openPopup();

    //Detectar el movimiento del marker
    marker.on('moveend', function(e) {
        marker = e.target;
        const posicion = marker.getLatLng();
        map.panTo(new L.LatLng(posicion.lat, posicion.lng));

        //Reverse geocoding, cuando el usuario reubica el pin
        geocodeService.reverse().latlng(posicion, 15).run(function(error, resul) {

            llenarInputs(resul);

            //Asignar los valores al popup del marker
            marker,bindPopup(resul.address.LongLabel);
        })
    });

    //Aignar al contenedor markers
    markers.addLayer(marker);
}

document.addEventListener('DOMContentLoaded', () => {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //Buscar direccion 
    const buscador = document.addEventListener('input', buscarDireccion);
});

function buscarDireccion(e) {
    if(e.target.value.length > 8) {

        //Si existe un pin anterior limpiarlo
        markers.clearLayers();
        
        const provider = new OpenStreetMapProvider();
        provider.search({ query: e.target.value }).then( resultado => {
            
            geocodeService.reverse().latlng(resultado[0].bounds[0], 15).run(function(error, resul) {
                
                llenarInputs(resul);

                //Mostrar en el mapa
                map.setView(resultado[0].bounds[0], 15);

                //agregar el pin
                marker = new L.marker(resultado[0].bounds[0], {
                    draggable: true,
                    autoPan: true
                })
                .addTo(map)
                .bindPopup(resultado[0].label)
                .openPopup();

                //Detectar el movimiento del marker
                marker.on('moveend', function(e) {
                    marker = e.target;
                    const posicion = marker.getLatLng();
                    map.panTo(new L.LatLng(posicion.lat, posicion.lng));

                    //Reverse geocoding, cuando el usuario reubica el pin
                    geocodeService.reverse().latlng(posicion, 15).run(function(error, resul) {

                        llenarInputs(resul);

                        //Asignar los valores al popup del marker
                        marker,bindPopup(resul.address.LongLabel);
                    })
                });

                //Aignar al contenedor markers
                markers.addLayer(marker);
            });  
        });
        //console.log(e.target.value);
    }
}

function llenarInputs(resultado) {

    console.log(resultado);
    document.querySelector('#direccion').value = resultado.address.Address || '';
    document.querySelector('#ciudad').value = resultado.address.City || '';
    document.querySelector('#region').value = resultado.address.Region || '';
    document.querySelector('#pais').value = resultado.address.CountryCode || '';
    document.querySelector('#lat').value = resultado.latlng.lat || '';
    document.querySelector('#lng').value = resultado.latlng.lng || '';
};



//avenida los pajaritos 4365 maipu
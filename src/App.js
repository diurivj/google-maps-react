import React, { Component, createRef } from 'react';

class App extends Component {
  // Creamos referencias para poder referirnos o manipular los nodos de HTML (parecido al querySelector)
  googleMapRef = createRef(); // Para el div donde mostraremos el mapa
  inputRef = createRef(); // Para el input donde escribiremos nuestra busqueda

  componentDidMount() {
    // Creamos una etiqueta script para poder ponerla en nuestro DOM
    const googleMapScript = document.createElement('script');
    // Agregamos el script de google maps para poderlo utilizar de manera tradicional, como si fuera HTML
    googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${TienesQueCambiarEstoPorTuAPIKEY}&libraries=places`;
    // Lo agregamos al DOM
    document.body.appendChild(googleMapScript);

    // Agregamos un listener, para saber cuando ya cargo toda la informacion de google maps
    googleMapScript.addEventListener('load', () => {
      // Creamos un atributo en nuestro componente llamado googleMap y searchBox
      // Aqui guardaremos nuestro mapa, con una metodo que escribimos abajo
      this.googleMap = this.createGoogleMap();
      // Aqui guardaremos nuestro searchBox, con una metodo que escribimos abajo
      this.searchBox = this.createSearchBox();
      // Agregamos un listener al mapa, para que cuando cambien los limites, nos diga cuanto cambio
      this.googleMap.addListener('bounds_changed', () => {
        this.searchBox.setBounds(this.googleMap.getBounds());
      });
      // En este array guardaremos los markes de todos los places que encuentre nuestro searchBox
      let markers = [];
      // Al searchBox le agregamos un listener para que se dispare cada que hagamos una busqueda
      this.searchBox.addListener('places_changed', () => {
        // El searchBox tiene un metodo para obtener los places que encuentre segun al criterio de busqueda que le damos
        const places = this.searchBox.getPlaces();
        // Si no encuentra nada, pues que no haga nada ¯\_(ツ)_/¯
        if (places.length === 0) {
          return;
        }
        // Recorremos todos los markers que tengamos
        markers.forEach((marker) => {
          marker.setMap(null);
        });
        // Y al final lo vaciamos
        markers = [];
        // Obtenemos los bounds del mapa, para hacer resize del mapa segun a los criterios de busqueda
        const bounds = new window.google.maps.LatLngBounds();
        // Todos los places que encuentre, nos los da en un array, entonces tenemos que recorrerlo para saber cada uno
        places.forEach((place) => {
          //  Si el lugar no tiene coordenadas, no podemos poner un marker
          if (!place.geometry) {
            console.log('Returned place contains no geometry');
            return;
          }
          // Creamos un icono segun al tipo de place que encuentre, esto ya lo hace google maps
          const icon = {
            url: place.icon,
            size: new window.google.maps.Size(71, 71),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(17, 34),
            scaledSize: new window.google.maps.Size(25, 25)
          };
          // Agregamos el nuevo marker a nuestro array, para poderlos desplegar despues
          markers.push(
            new window.google.maps.Marker({
              map: this.googleMap,
              icon,
              title: place.name,
              position: place.geometry.location
            })
          );
          // Para algunas coordenadas diferentes de algunos places
          if (place.geometry.viewport) {
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });
        // Al final todo lo juntamos bonito en el mapa
        this.googleMap.fitBounds(bounds);
      });
    });
  }

  createGoogleMap = () => {
    return new window.google.maps.Map(this.googleMapRef.current, {
      zoom: 15,
      center: {
        lat: 19.421311,
        lng: -99.1631419
      }
    });
  };

  createSearchBox = () => {
    return new window.google.maps.places.SearchBox(this.inputRef.current);
  };

  render() {
    return (
      <>
        <input
          ref={this.inputRef}
          placeholder="Search"
          style={{
            margin: '0 auto',
            width: '800px',
            height: '20px'
          }}
        />
        <div ref={this.googleMapRef} style={{ width: '806px', height: '400px' }} />
      </>
    );
  }
}

export default App;

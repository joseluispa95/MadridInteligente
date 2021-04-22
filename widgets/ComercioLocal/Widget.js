define(['dojo/_base/declare', 'jimu/BaseWidget', "esri/tasks/locator", "dojo/_base/lang", "esri/graphic", "esri/geometry/Point", "esri/layers/FeatureLayer", "esri/tasks/query", "esri/geometry/Circle", "esri/InfoTemplate", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/PictureMarkerSymbol", "dojo/_base/Color", "dojo/_base/array", "dojo/dom", "dojo/on", "dojo/parser", "dojo/ready", "dijit/layout/BorderContainer", "dijit/layout/ContentPane"], function (declare, BaseWidget, Locator, lang, Graphic, Point, FeatureLayer, Query, Circle, InfoTemplate, SimpleMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol, PictureMarkerSymbol, Color, array) {
      //To create a widget, you need to derive from BaseWidget.
      return declare([BaseWidget], {

            // Custom widget code goes here

            baseClass: 'comercio-local',
            // this property is set by the framework when widget is loaded.
            // name: 'ComercioLocal',
            // add additional properties here

            //methods to communication with app container:

            buscar: function buscar() {

                  // Construimos el localizador
                  taskLocator = new Locator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");
                  taskLocator.on("address-to-locations-complete", lang.hitch(this, this.showResults));
                  taskLocator.on("address-to-locations-complete", lang.hitch(this, this.closebuffer));

                  // Cargamos el servicio de capa de pequeños comercios y le damos una visibilidad falsa para que luego solo se cargen aquellos que aparecen dentro del buffer
                  var urlComLoc = 'https://pcjlp/server/rest/services/SmartCities/comercioLocal/MapServer/0';

                  comLoc = new FeatureLayer(urlComLoc, {
                        outFields: ["nombre_loc", "distrito", "tipo_comer"]
                  });

                  this.map.graphics.clear();

                  var objAddress = {
                        "SingleLine": this.ubicacion.value
                  };

                  var params = {
                        address: objAddress,
                        outFields: ["Loc_name"]
                  };

                  taskLocator.addressToLocations(params);
            },

            borrar: function borrar() {
                  this.map.graphics.clear();
            },

            showResults: function showResults(candidates) {

                  // Define the symbology used to display the results
                  var symbolMarker = new SimpleMarkerSymbol();
                  symbolMarker.setStyle(SimpleMarkerSymbol.STYLE_CROSS);
                  symbolMarker.setColor(new Color([255, 0, 0, 0.75]));

                  //Recibe el valor de entrada de la función showResults y toma la dirección
                  array.every(candidates.addresses, lang.hitch(this, function (candidate) {

                        // Toma el valor que es más probable
                        if (candidate.score > 80) {

                              // Recupera información de atributos del candidato
                              var attributesCandidate = {
                                    address: candidate.address,
                                    score: candidate.score,
                                    locatorName: candidate.attributes.Loc_name
                              };

                              //Toma la localización del candidato
                              geometryLocation = candidate.location;

                              // Representa el resultado del localizador
                              var graphicResult = new Graphic(geometryLocation, symbolMarker, attributesCandidate);
                              this.map.graphics.add(graphicResult);

                              return false;
                        }
                  }));

                  // Centra y hace zoom a la localización
                  if (geometryLocation !== undefined) {
                        this.map.centerAndZoom(geometryLocation, 15);
                  }
            },
            closebuffer: function closebuffer() {

                  // Para meter el centro del buffer hace falta añadir la x e y del punto almacenado en el geometryLocation
                  point = new Point({
                        x: geometryLocation.x,
                        y: geometryLocation.y
                  });

                  circle = new Circle({
                        center: point,
                        geodesic: true,
                        radius: this.distance.value,
                        radiusUnit: "esriMeters"
                  });
                  var poligonobuffer = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]));

                  this.map.graphics.add(new Graphic(circle, poligonobuffer));
                  this.callLocalComerce(circle);
            },
            callLocalComerce: function callLocalComerce(LC) {

                  // Montamos la query
                  var localQuery = new Query();
                  localQuery.geometry = LC;
                  comLoc.selectFeatures(localQuery, FeatureLayer.SELECTION_NEW);

                  // Creamos una nueva seleción y abrimos una función nueva
                  comLoc.on("selection-complete", lang.hitch(this, this.muestraComLoc));
            },
            muestraComLoc: function muestraComLoc(resultados) {

                  // Simbología para los puntos seleccionados por categorías
                  // URLs de los archivos .png que utilizaran como icono en la aplicación
                  urlCarni = "./images/meat.png";

                  urlPan = "./images/bread.png";

                  urlFrut = "./images/healthy-food.png";

                  urlPesc = "./images/fish.png";

                  // Carnicerías
                  var markerCarniceria = new PictureMarkerSymbol();
                  markerCarniceria.setUrl(urlCarni);
                  markerCarniceria.setHeight(25);
                  markerCarniceria.setWidth(25);

                  // Pescaderías
                  var markerPescaderia = new PictureMarkerSymbol();
                  markerPescaderia.setUrl(urlPesc);
                  markerPescaderia.setHeight(30);
                  markerPescaderia.setWidth(30);

                  // Frutería
                  var markerFruteria = new PictureMarkerSymbol();
                  markerFruteria.setUrl(urlFrut);
                  markerFruteria.setHeight(25);
                  markerFruteria.setWidth(25);

                  // Panadería
                  var markerPanaderia = new PictureMarkerSymbol();
                  markerPanaderia.setUrl(urlPan);
                  markerPanaderia.setHeight(25);
                  markerPanaderia.setWidth(25);

                  // Simbología NULL
                  var symbolNull = new SimpleMarkerSymbol();
                  symbolNull.setSize("0");

                  array.forEach(resultados.features, lang.hitch(this, function (feature) {

                        // Pop-Up
                        var json = { title: "Comercios cercanos", content: "<strong>Nombre Local </strong>: ${nombre_loc}<br><strong>Tipo comercio</strong>: ${tipo_comer}<br><strong>Distrito</strong>: ${distrito}" };
                        template = new InfoTemplate(json);

                        // Ajuste de simbología por tipo de comercio
                        if (feature.attributes.tipo_comer === "Carnicería") {

                              feature.setSymbol(markerCarniceria);
                              feature.setInfoTemplate(template);
                        } else if (feature.attributes.tipo_comer === "Pescadería") {

                              feature.setSymbol(markerPescaderia);
                              feature.setInfoTemplate(template);
                        } else if (feature.attributes.tipo_comer === "Frutería") {

                              feature.setSymbol(markerFruteria);
                              feature.setInfoTemplate(template);
                        } else if (feature.attributes.tipo_comer === "Panadería") {

                              feature.setSymbol(markerPanaderia);
                              feature.setInfoTemplate(template);
                        } else {

                              feature.setSymbol(symbolNull);
                        }

                        this.map.graphics.add(feature);
                  }));
            }
      });
});
//# sourceMappingURL=Widget.js.map

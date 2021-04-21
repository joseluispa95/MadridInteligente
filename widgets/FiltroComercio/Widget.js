define(['dojo/_base/declare', 'jimu/BaseWidget', "esri/layers/FeatureLayer", "esri/graphic", "esri/symbols/PictureMarkerSymbol", "esri/tasks/query"], function (declare, BaseWidget, FeatureLayer, Graphic, PictureMarkerSymbol, Query) {
    //To create a widget, you need to derive from BaseWidget.
    return declare([BaseWidget], {

        // Custom widget code goes here

        baseClass: 'filtrado-comercio',
        // this property is set by the framework when widget is loaded.
        // name: 'FiltroComercio',
        // add additional properties here

        startup: function startup() {

            // comLoc = this.map.getLayer("ComercioLocal_8383");


            urlComLoc = 'https://pcjlp/server/rest/services/PFM/localComerce/MapServer/0';
        },

        filtrar: function filtrar() {

            comLoc = new FeatureLayer(urlComLoc, {
                outFields: ["nombre_loc", "nombre_bar", "tipo_comer", "rating"]
            });

            comLoc.setDefinitionExpression("tipo_comer = '" + this.selectComercio.value + "'");

            this.map.addLayer(comLoc);
        },

        filtrardis: function filtrardis() {

            comLoc = new FeatureLayer(urlComLoc, {
                outFields: ["nombre_loc", "nombre_bar", "tipo_comer", "rating"]
            });

            comLoc.setDefinitionExpression("nombre_bar = '" + this.selectDistrito.value + "'");

            this.map.addLayer(comLoc);
        }

    });
});
//# sourceMappingURL=Widget.js.map

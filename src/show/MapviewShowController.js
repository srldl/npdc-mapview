'use strict';

var MapviewShowController = function($controller, $routeParams,$scope, $q, Mapview, npdcAppConfig, NpolarApiSecurity, npolarApiConfig, MapviewService, MapJsonService) {
    'ngInject';

  $controller('NpolarBaseController', {
    $scope: $scope
  });
  $scope.resource = Mapview;



  $scope.mapOptions = {};

  //Show map in Antarctica or Svalbard
  let arctic = [78.000, 16.000];
  //let antarctica = [-72.01667, 2.5333];

  //use map from Arctic or Antarctic?
  let mapselect = arctic;


  var L = require('leaflet');
  L.Icon.Default.imagePath = 'node_modules/leaflet/dist/images/';

  var map = L.map('mapid', {
      fullscreenControl: true,
      fullscreenControlOptions: {
      position: 'topleft'
      }}).setView(mapselect, 4);

    L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}/', {
       maxZoom: 18,
      attribution: 'Esmapri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community'
    }).addTo(map);

    // Initialise the FeatureGroup to store editable layers
    var drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);


     //Leaflet have problems with finding the map size
    //invalidateSize checks if the map container size has changed and updates map.
    //Since map resizing is done by css, need to delay the invalidateSize check.
    setTimeout(function(){ map.invalidateSize();}, 20);


   let show = function() {


    $scope.show().$promise.then((mapview) => {

       //Show database name as title
      let db = $scope.document.target_database;
      $scope.document.target_database = db.charAt(0).toUpperCase() + db.slice(1);

      //Fetch fields to search for
      let fields = "id," + $scope.document.geojson +
          ',' + $scope.document.select_parameters.parameter +
          ',' + $scope.document.display_parameters.parameters +
          ',' + $scope.document.display_parameters.main_heading +
          ',' + $scope.document.display_parameters.top_heading;

      //Fetch data
      let link =  npolarApiConfig.base + "/" + db +"/?q=&format=json&fields=" + fields;

      MapviewService.getValues(link).then
        // on success
        (function(results) {
            GetCoverage(results.data);
        }),
        //on failure
        (function(response,status){
            console.log("The request failed with response " + response + " and status code " + status);
        }); //end getValues

  });  //promise
  }; //show

  show();

  // Estimate the diagram values
  function GetCoverage(data) {

     console.log(data);

      //Get objects with locations, forget the rest
      let coverage;
      let len = data.feed.entries.length;

      for (let i = 0; i < len; i++) {
         //if locations exist and north is arctic
           if ((data.feed.entries[i].hasOwnProperty('locations'))&&(data.feed.entries[i].locations.north>0)){
             let loc = data.feed.entries[i].locations;
                coverage = [[loc.north, loc.west], [loc.north, loc.east],[loc.south, loc.east], [loc.south, loc.west]];
                L.polygon(coverage).addTo(map).bindPopup("Polygon 1.").openPopup();
             //   var popup = L.popup().setLatLng([78.000, 14.000]).setContent("Polygon 2.").openOn(map);

             //  map.openModal({
             //    content: 'Content goes here'
             //    });

               map.fire('modal', {
                content: 'your content HTML'
               });


   //   L.marker([-72.011389, 2.735]).addTo(map).bindPopup('A popup - easily customizable.').openPopup();
// }
          }
      }


  }

};




module.exports = MapviewShowController;
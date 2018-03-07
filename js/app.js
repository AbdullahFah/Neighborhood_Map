// loading Google map
let map;
function initMap() {
    "use strict";
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 24.712125, lng: 46.671170},
        zoom: 15
    });
    ko.applyBindings(new ViewModel());
}

// For Humberger menu
function myFunction(x) {
    x.classList.toggle("change");
}

// if there is google map error
function googleError() {
    "use strict";
    document.getElementById('errorDiv').innerHTML = "<h3>Google map is currently not working.</h3>";
}

// Places on map
var places = [
    {
        name: "starbucks",
        lat: 24.715038, 
        lng: 46.677824
    },
    {
        name: "Italian House",
        lat: 24.714860, 
        lng: 46.669938
    },
    {
        name: "Five Guys",
        lat: 24.713593,  
        lng: 46.675313
    },
    {
        name: "Subway Resturant",
        lat: 24.712346, 
        lng: 46.674841
    },
    {
        name: "mcdonalds",
        lat: 24.713537, 
        lng: 46.673596
    }
];

// Constructor
var Place = function (data) {
    "use strict";
    this.name = ko.observable(data.name);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
    this.marker = ko.observable();
    this.link = ko.observable('');
};

// the viewmodel
var ViewModel = function () {
    console.log("View Model is now called!");
    "use strict";
    var self = this;

    this.placeList = ko.observableArray([]);

    places.forEach(function (place) {
        self.placeList.push(new Place(place));
    });

    var informationWindow = new google.maps.InfoWindow({
        maxWidth: 150
    });

    self.placeList().forEach(function (place) {

        // add markers for the places
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(place.lat(), place.lng()),
            map: map
        });
        place.marker = marker;

        //Wikipedia ajax request
        $.ajax({
            url: 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + place.name() + '&format=json&callback=wikiCallback',
            dataType: "jsonp",
            success: function (response) {
                console.log(response[0]);
                console.log(response[3][0]);
                let placeName = response[0];
                let placeLink = response[3][0];

                var infoWindowString = '<div id="window"><h3>' + placeName + '</h3><p><a href=' + placeLink + '>' + placeLink +
                    '</a></p>';

                google.maps.event.addListener(place.marker, 'click', function () {
                    informationWindow.open(map, this);
                    place.marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function () {
                        place.marker.setAnimation(null);
                    }, 500);
                    informationWindow.setContent(infoWindowString);
                    map.setCenter(place.marker.getPosition());
                });

            },
            error: function (e) {
                informationWindow.setContent('<h5>Wikipedia is currently unavailable.</h5>');
            }

        });


        // To show error from wiki
        google.maps.event.addListener(place.marker, 'click', function () {
            informationWindow.open(map, this);
            place.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                place.marker.setAnimation(null);
            }, 500);

        });
    });

    self.visible = ko.observableArray();

    self.placeList().forEach(function (place) {
        self.visible.push(place);
    });

    // Filtering list and markers
    self.searchInput = ko.observable('');
    self.filter = function () {
        self.visible.removeAll();
        let searchInput = self.searchInput();
        self.placeList().forEach(function (place) {
            place.marker.setVisible(false);
            if (place.name().toLowerCase().indexOf(searchInput) !== -1) {
                self.visible.push(place);
            }
        });
        self.visible().forEach(function (place) {
            place.marker.setVisible(true);
        });
    };


    self.triggerMarker = function (place) {
        google.maps.event.trigger(place.marker, 'click');
    };
    
    // Hiding and showing the list
    self.toggleList = ko.observable(false);
    this.listStatus = ko.pureComputed (function () {
        if (self.toggleList() === false) {
            return 'listClosed';
        } else {
            return 'listShown';
        }
    }, this);

    self.showList = function (toggleList) {
        if (self.toggleList() === false) {
            self.toggleList(true);
        } else {
            self.toggleList(false);
        }
        return true;
    };
};
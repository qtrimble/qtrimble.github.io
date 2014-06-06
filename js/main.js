/**
 * @author qtrimble
 */
var map,bounds,infowindow,markers = [],complete = [],incomplete = [],completeSums = [],incompleteSums = [];
var zipcodes = ['28704', '28715', '28732', '28801', '28803', '28804', '28805', '28806'];
$(document).ready(function() {
	/*
	 * PANEL 1 DEFAULTS
	 *
	 *
	 */
	var d = new Date(); // today date components
	var year = d.getFullYear();
	// set current year
	$('#year option').each(function(i, item) {
		if ($(this).prop('value') == year){
			$(this).prop('selected', true);
		}
	});
	var monthNum = d.getMonth()+1;
	$('#m-'+monthNum).addClass('active'); // set the current month
	$('#panel1 h3').text('Reported Graffiti Incidents (' + $('#month li.active').text() + ' ' + $('#year :selected').text() + ')');
	// get the min/max dates of the clicked month
	var startDay = $('#month li.active').text() + ' ' + 1 + ', ' + $('#year :selected').text();
	var endDay = $('#month li.active').text() + ' ' + daysInMonth($('#month li.active').attr('id').substring(2,3),$('#year :selected').text()) + ', ' + $('#year :selected').text() + ' 11:59:59';
	var mdata = requestData(Date.parse(startDay)/1000,Date.parse(endDay)/1000); // get the data	
	$('#total').text(mdata['response'].count + ' graffiti incidents reported in ' + $('#month li.active').text() + ' ' + $('#year :selected').text()); // report count to user
	// google map
	var mapOptions = {
		center: new google.maps.LatLng(35.58, -82.555833),
		mapTypeControl: true,
		mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		zoom: 12
	};
	map = new google.maps.Map($("#map")[0],mapOptions);
	infowindow = new google.maps.InfoWindow({maxWidth: 500});
	if (mdata['response'].count > 0) {			
		addMarkers(mdata['response'].requests);
		$('#status').append('<div id="complete">'+complete.length + ' incidents completed</div><div id="incomplete">'+incomplete.length + ' incidents still need addressed</div>');
	}
	/*
	 * PANEL 2 DEFAULTS
	 *
	 *
	 */
	$('#panel2 h3').text('Number of Graffiti Incidents by Zip Code (' + $('#month li.active').text() + ' ' + $('#year :selected').text() + ')');
	// get the total number of requests per zipcode
	$.each(zipcodes, function(i, zip) {
		completeSums.push(count(complete, zip));
		incompleteSums.push(count(incomplete, zip));
	});
	$('#chart').highcharts().series[0].setData(completeSums,true); // add series 1 data to the chart
	$('#chart').highcharts().series[1].setData(incompleteSums,true); // add series 2 data to the chart
	/*
	 * EVENTS
	 *
	 *
	 */
	$('#month li').on('click', function() {		
		$('#month li').removeClass('active'); // remove any "active" class
		$(this).addClass('active'); // add "active" class to this		
		update();
	});
	$('#year').on('change', function() {
		update();
	});
});
// return the count of a particular vaule in an array
function count(array, value) {
	var counter = 0;
	for(var i=0;i<array.length;i++) {
		if (array[i] === value) counter++;
	}
	return counter;
}
// get data from publicstuff with start and end dates
function requestData(startDay,endDay) {
	var result;
	$.ajax({
		url: 'http://www.publicstuff.com/api/2.0/requests_list',
		data: {return_type: 'json', limit: '1000', after_timestamp: startDay, before_timestamp: endDay, lat: '35.62336', lon: '-82.561531', request_type_id: '11339', api_key: '58j013k159vpqz87xd85df0uy7epvl'},
		dataType: 'json',		
		async: false,
		cache: false
	})		
	.done(function(data) {
		result = data;
	});
	// .fail(function(jqxhr, textStatus, error ) {
    	// var err = textStatus + ", " + error;
    	// //console.log( "Request Failed: " + err );
   	// })
    // .always(function() {
		// //console.log("got data for active platforms");
	// });	
	return result;
}
// get the amount of days for a given month
function daysInMonth(month,year) {
   return new Date(year, month, 0).getDate();
}
// bind content to infowindow
function bindInfoWindow(clickedMarker,iw,iwc) {	
	google.maps.event.addListener(clickedMarker, 'click', function() {
		iw.setContent(iwc);
		iw.open(map,clickedMarker);		
	});
}
function addMarkers(requests) {
	bounds = new google.maps.LatLngBounds();
	// loop over requests array to put markers on the map
	$.each(requests, function(i, request) {
		var coords = new google.maps.LatLng(request['request'].lat,request['request'].lon);	
		var styleMaker = new StyledMarker({
			id: request['request'].id,			
			map:map,
			position: coords,			
			styleIcon: request['request'].status == "completed" ? new StyledIcon(StyledIconTypes.MARKER,{color:"87CEEB"}) : new StyledIcon(StyledIconTypes.MARKER,{color:"FF6347"}),
			title: request['request'].title
		});
		markers.push(styleMaker);
		bounds.extend(coords);	
		var infoContent = '<h1>'+request['request'].title+'</h1><div>submitted by '+request['request'].user +' on '+new Date(request['request'].date_created*1000).toLocaleString()+'</div><p>status: '+request['request'].status+'</p><p>address: '+request['request'].address+'</p><p>description: '+request['request'].description+'</p>';
		if (request['request'].image_thumbnail != '') {
			infoContent+= '<p><img src="'+request['request'].image_thumbnail+'" width="320"/></p>';
		}
		// marker object, infowindow object, infowindow content
		bindInfoWindow(styleMaker,infowindow,infoContent);				
		// populate status arrays
		request['request'].status == "completed" ? complete.push(request['request'].zipcode) : incomplete.push(request['request'].zipcode);
	});
	map.fitBounds(bounds);
}
// remove markers from map
function clearMarkers() {
	$.each(markers, function(j, marker) {
		marker.setMap(null);
	});		
}
// update map and chart
function update() {
	// get the min/max dates of the clicked month
	startDay = $('#month li.active').text() + ' ' + 1 + ', ' + $('#year :selected').text();
	endDay = $('#month li.active').text() + ' ' + daysInMonth($('#month li.active').attr('id').substring(2,3),$('#year :selected').text()) + ', ' + $('#year :selected').text() + ' 23:59:59';	
	mdata = requestData(Date.parse(startDay)/1000,Date.parse(endDay)/1000);	// get the data		
	// report count to user and update headers
	$('#total').text(mdata['response'].count + ' graffiti incidents reported in ' + $('#month li.active').text() + ' ' + $('#year :selected').text());
	$('#panel1 h3').text('Reported Graffiti Incidents (' + $('#month li.active').text() + ' ' + $('#year :selected').text() + ')');
	$('#panel2 h3').text('Number of Graffiti Incidents by Zip Code (' + $('#month li.active').text() + ' ' + $('#year :selected').text() + ')');
	complete = [],incomplete = [],completeSums = [],incompleteSums = []; // empty arrays		
	// do stuff with response
	clearMarkers(); // remove the markers from the map before adding new ones
	if (mdata['response'].count > 0) {			
		$('#status div').remove();			
		addMarkers(mdata['response'].requests);			
		$('#status').append('<div id="complete">'+complete.length + ' incidents completed</div><div id="incomplete">'+incomplete.length + ' incidents still need addressed</div>');
	} else {
		$('#status div').remove();
	}		
	// get the total number of requests per zipcode
	$.each(zipcodes, function(i, zip) {
		completeSums.push(count(complete, zip));
		incompleteSums.push(count(incomplete, zip));			
	});
	$('#chart').highcharts().series[0].setData(completeSums,true);// update the chart	
	$('#chart').highcharts().series[1].setData(incompleteSums,true);// update the chart		
}
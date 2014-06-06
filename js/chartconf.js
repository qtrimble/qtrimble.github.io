/**
 * @author qtrimble
 */
var chart = new Highcharts.Chart({
	chart: {
		type: 'column',
		renderTo: 'chart'
	},
	legend: {
		enabled: false
	},
	title: {
		text: ''
	},
	subtitle: {
		text: ''
	},
	xAxis: {
		categories: ['28704', '28715', '28732', '28801', '28803', '28804', '28805', '28806']
	},
	yAxis: {
		min: 0,
		max: 8,
		title: {
			text: 'Number of Requests'
		}
	},
	tooltip: {
		formatter: function() {
			return '<b>'+ this.x +'</b><br/>'+
			this.series.name +': '+ this.y +'<br/>'+
			'total: '+ this.point.stackTotal;
		}
	},
	plotOptions: {
		column: {
			pointPadding: 0.2,
			borderWidth: 0,
			stacking: 'normal'
		}
	},
	series: [{
		name: 'complete',
		stack: 'status',
		color: '#87CEEB'
		},{
		name: 'incomplete',
		stack: 'status',
		color: '#FF6347'
	}]
});
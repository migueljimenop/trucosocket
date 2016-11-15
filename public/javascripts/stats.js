$(document).ready(function(){
	var stats = $("#stats");
	var pieData = [
	   {
	      value: a,
	      label: 'Ganadas',
	      color: '#2EFE2E'
	   },
	   {
	      value: b,
	      label: 'Perdidas',
	      color: '#FE2E2E'
	   }
	];
	var context = document.getElementById('stats').getContext('2d');
	var skillsChart = new Chart(context).Pie(pieData);
});
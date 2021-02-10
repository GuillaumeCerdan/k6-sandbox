import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter } from 'k6/metrics';

// Librairie pour lire csv, à remplacer par une lib locale lors de tirs monitorés
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

// SharedArray est super important car sinon, la récupération de données est
// effectuée à chaque VU
import { SharedArray } from "k6/data";

// Permet de parser du HTML, à voir les sélecteurs disponibles
//import { parseHTML } from 'k6/html';

var csv = false;
var data = null;

if (csv) {
	data = new SharedArray("another data name", function() {
		return papaparse.parse(open('./data/vus.csv'), { header: true }).data;
	});

	// Log tous les users
	for (var user of data) {
		console.log(JSON.stringify(user));
	}

} else {
	data = new SharedArray("some data name", function() { 
		return JSON.parse(open('./data/stages.json')).stages;
	});

	// Log tous les stages
	for (var stage of data) {
		console.log(JSON.stringify(stage));
	}
}


// A simple counter for http requests
export const requests = new Counter('http_reqs');



export const options = {
	stages: [
		// autant de VU qu'il y a d'item dans le json
		{ target: data.length, duration: '5s' }
	],
	thresholds: {
		requests: ['count < 100'],
	},
};


export default function () {

	//basicGetRequest()
	basicPostRequest()

	// Log l'id du VU actuel / la durée du stage dans le json à l'index du VU actuel
  	

	// __ITER --> Itération du VU actuel
	// __VU --> A déchiffrer
  	//console.log(__ITER + " / " + data[__ITER].duration);
	//console.log(__VU + " / " + data[__VU].duration);

	
 
  //console.log(JSON.stringify(res));
}

function basicGetRequest() {

	const res = http.get('http://guillaumecerdan.fr/');
	
	// Parse le body
	//const doc = parseHTML(res.body);
	
	sleep(1);
	
	const checkRes = check(res, {
		'status is 200': (r) => r.status === 200,
		'response body': (r) => r.body.indexOf('Feel free to browse') !== -1,
	});

}

function basicPostRequest() {
	
	const payload = JSON.stringify({ title: 'title', body: 'body', userId: __ITER });
	const params = { headers: { 'Content-Type': 'application/json' } };
	const res = http.post('https://jsonplaceholder.typicode.com/posts', payload, params);

	const checkRes = check(res, {
		'status is 200': (r) => r.status === 200,
		'status is 201': (r) => r.status === 201,
		'response body': (r) => r.body.indexOf('Feel free to browse') !== -1,
	});

}
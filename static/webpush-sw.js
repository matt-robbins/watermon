
self.addEventListener('install', () => {
	self.skipWaiting();
});

// self.addEventListener('activate', function(event) {
//     event.waitUntil(self.clients.claim()); // Become available to all pages
// });

self.addEventListener('push', function(event) {
	const channel = new BroadcastChannel('sw-messages');
	data = event.data.json()
	channel.postMessage(data);

	console.log(data)

	// if (data.name != "al"){
	// 	return
	// }
	// if (data.status != true) {
	// 	return
	// }
	var notificationTitle = 'Pump Status Change';
	var msg = "Pump " + data.name + ": " + (data.status ? "running" : "stopped");

	if (data.name == "al") {
		notificationTitle = 'Pump Alarm'
		msg = data.status ? "Uh Oh" : "Okay"
	}

	const notificationOptions = {
		body: msg,
		data: {},
	};

	// if (event.data) {
	// 	const d = JSON.parse(event.data.text());
	// 	notificationTitle = d.location +' '+ d.message;
	// 	notificationOptions.body = d.sass;
	// }
    // clients.matchAll().then(function(cli){
    //     console.log("clients: " +cli)
    //     cli[0].postMessage("hello")
    // });

	event.waitUntil(
		self.registration.showNotification(
			notificationTitle,
			notificationOptions,
		),
	);
});

self.addEventListener('notificationclick', function(event) {
	console.log('Notification clicked.');
	event.notification.close();

	// let clickResponsePromise = Promise.resolve();
	// if (event.notification.data && event.notification.data.url) {
	// 	clickResponsePromise = clients.openWindow(event.notification.data.url);
	// }

	// event.waitUntil(clickResponsePromise);
});
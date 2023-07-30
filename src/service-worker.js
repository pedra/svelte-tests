/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
	'/',
    ...build, // the app itself
    ...files  // everything in `static`
];

console.log('ServiceWorker:', CACHE, ASSETS)


const CONFIG = '/config'

// INSTALL  -------------------------------------------------------------------------
self.addEventListener('install', (e) => {
	e.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => {
				console.log('[SWORKER caching "' + CACHE + '"]')
				cache.addAll(ASSETS)
			})
			.then(() => {
				sendMessage({text: 'install'})
				self.skipWaiting()				
			}),
	)
})

// ACTIVATE -------------------------------------------------------------------------
self.addEventListener('activate', (e) => {
	e.waitUntil(
		caches.keys().then(async (ks) => {
			for (const k of ks) {
				if (k !== CACHE) {
					console.log('[SWORKER removing "' + k + '" cache]')
					await caches.delete(k)
				}
			}
			sendMessage({text: 'activate'})
			self.clients.claim()
		}),
	)
})

// FETCH   --------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
	const {
		request,
		request: { url, method },
	} = event

	// Save||load json data in Cache Storage CONFIG
	if (url.match(CONFIG)) {
		if (method === 'POST') {
			request
				.json()
				.then((body) =>
					caches
						.open(CACHE)
						.then((cache) =>
							cache.put(
								CONFIG,
								new Response(JSON.stringify(body)),
							),
						),
				)
			return event.respondWith(new Response('{}'))
		} else {
			return event.respondWith(
				caches
					.match(CONFIG)
					.then((response) => response || new Response('{}')),
			)
		}
	} else {
		// Get & save request in Cache Storage
		if (method !== 'POST') {
			event.respondWith(
				caches.open(CACHE).then((cache) =>
					cache.match(event.request).then(
						(response) =>
							response ||
							fetch(event.request).then((response) => {

								sendMessage({text: 'fetch', url, method})

								if (
									url.startsWith('chrome-extension') ||
									url.includes('extension') ||
									!(url.indexOf('http') === 0)
								)
									return response
								if (
									(url.includes('/media/img/') ||
									url.includes('/media/page/') ||
                                    url.includes('https://i.ytimg.com/vi/')) &&
									!(url.includes('https://www.youtube.com/iframe_api'))
								)
									cache.put(event.request, response.clone())
								return response
							}),
					),
				),
			)
		} else return
	}
})

// PUSH   ---------------------------------------------------------------------------
self.addEventListener('push', (event) => {
	event.waitUntil(
		self.clients.matchAll().then((clientList) => {
			console.log(
				`[Service Worker] Push had this data: "${event.data.text()}"`,
			)

			var focused = clientList.some((client) => {
				console.log('[CLIENT]', client)
				client.postMessage({ msg: event.data.json(), type: 'push' })
				return client.focused
			})

			var msg = {
				title: 'error',
				body: 'Ocorreu um erro no envio de notificação!',
			}
			try {
				msg = event.data.json()
			} finally { /* empty */ }

			// Para mudar o comportamento caso o FOCO do app esteja diferente: aberto (focado), fora de foco (mas, aberto) e fechado
			if (focused) {
				msg.body += "You're still here, thanks!"
			} else if (clientList.length > 0) {
				msg.body +=
					"You haven't closed the page, click here to focus it!"
			} else {
				msg.body +=
					'You have closed the page, click here to re-open it!'
			}

			const title = msg.title
			const options = {
				body: msg.body || 'Você tem uma nova mensagem da FreedomeE!',
				icon: msg.icon || '/favicon/android-chrome-192x192.png',
				badge: msg.badge || '/favicon/favicon-32x32.png',
				image: msg.image || '/img/push.jpg',
				vibrate: msg.vibrate || [],
				data: JSON.parse(
					'undefined' == typeof msg['data'] ? false : msg['data'],
				),
			}

			return self.registration.showNotification(title, options)
		}),
	)
})

// CLICK EM NOTIFICAÇÃO
// ---------------- clicar em uma mensagem e abrir o aplicativo----------------------
self.addEventListener('notificationclick', (event) => {
	event.waitUntil(
		self.clients.matchAll().then((clientList) => {
			console.log(
				'[Service Worker] Notification click Received.',
				clientList,
				event.notification.data,
			)

			var data =
				'undefined' !== typeof event.notification['data']
					? event.notification.data
					: {}

			event.notification.close()

			if (clientList.length > 0) {
				clientList[0].focus()
				return clientList[0].postMessage({
					msg: data,
					type: 'clientList[0]',
				})
			} else {
				self.clients
					.openWindow('/profile')
					.then((c) => {
						console.log('CLIENT OpenWindow: ', c)
						return c
					})
					.then((a) => {
						return a.postMessage({
							msg: data,
							type: 'clientList - clients - c',
						})
						// })
						// //if (c.length > 0) {
						//     //console.log('Dentro de if: ', c[0])
						//     c.focus()

						// return c.postMessage({msg: data, type: 'clients'})
					})
			}
		}),
	)
})

// SYNC -----------------------------------------------------------------------------
// https://learn.microsoft.com/pt-br/microsoft-edge/progressive-web-apps-chromium/how-to/background-syncs#use-the-periodic-background-sync-api-to-regularly-get-fresh-content
self.addEventListener('periodicsync', (event) => {
	console.log('Periodic Sync',  event)
	if (event.tag === 'get-daily-news') {
		//event.waitUntil(getDailyNewsInCache())
	}
})



// Receive messages from the main script.
self.onmessage = function (e) {
	console.log('Message from main script:', e.data)
	if (e.data.action === 'skipWaiting') {
		self.skipWaiting()
	}
	if (e.data.action === 'update') {
		self.registration.update()
	}
	if (e.data.action === 'sync') {
		self.registration.sync.register('sync-news')
			.then(() => {
				console.log('Sync registered')
		})
	}
	sendMessage({type: 'receive', msg: e.data})

}

function sendMessage(message) {
	self.clients.matchAll().then(a => {
		if(a[0]) {
			self.clients.get(a[0].id).then(client => {
				client.postMessage(message)
			})
		}
	})
}



// "gcm_sender_id": "103953800507"

<script client>
// @ts-nocheck

	import { onMount } from 'svelte';

	onMount(() => {
		window['xpushdata'] = [];

		if ('serviceWorker' in navigator) {
			console.log('Teste A');
			navigator.serviceWorker.addEventListener('message', (e) => {
				console.log('Teste B');
				console.log('SWMessage:', e.data);
				//if (e.data.msg == 'restart' && e.data.type == 'sw') window.location.reload();

				xpushdata.push(e.data);
			});
		}

		/**
		 * @param {any} message
		 * 
		 * Send message to Service Worker
		 */
		window['sendMessage'] = (message) => {
			return new Promise(function (resolve, reject) {
				var messageChannel = new MessageChannel()
				messageChannel.port1.onmessage = function (event) {
					
					if (event.data.error) {
						return reject(event.data.error)
					} else {
						return resolve(event.data)
					}
				}
				
				navigator?.serviceWorker?.controller?.postMessage(message, [messageChannel.port2])
			});
		}
	});

	export function load({ params }) {}
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

// subscribe to push notifications
async function subscribe() {
    const res = await fetch('/vapid_public');
    const vapid_server_key = await res.text();

    const registration = await navigator.serviceWorker.register('/webpush-sw.js');
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapid_server_key
    });

    syncSubscription(subscription)
}

async function syncSubscription(subscription) {
    await fetch('/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
    });
}
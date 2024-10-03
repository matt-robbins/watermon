// subscribe to push notifications
async function subscribe() {
    const res = await fetch('/vapid_public');
    const vapid_server_key = await res.text();

    var registration = null
    try {
        registration = await navigator.serviceWorker.register('/webpush-sw.js');
        registration.update();
    }
    catch (e) {
        alert("failed to register service worker. You might need to add this webpage to your home screen.")
    }

    console.log(registration)
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapid_server_key
    });
    console.log(subscription)
    syncSubscription(subscription)
    setSubscribed(true)
}

async function syncSubscription(subscription) {
    await fetch('/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
    });
}
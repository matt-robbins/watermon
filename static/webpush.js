// subscribe to push notifications
async function subscribe() {
    const registration = await navigator.serviceWorker.register('/webpush-sw.js');
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'BLUaIGdwCItGdW7FjlENYQecIqwzAL7v2h3tZXmulIyUBGlAu19nbJCVD17LD2Vw8iRboyW8-Z5vGmgF9KnaG_Q'
    });

    await fetch('/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
    });
}
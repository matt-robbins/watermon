
function showStatus(name, status) {
    el = document.getElementById(name)
    if (el == null) {
        return;
    }
    if (status == 1){
        el.classList.add("on")
    }
    else {
        el.classList.remove("on")
    }
}

function showOnline(lastupdate,fail) {
    const now = new Date();

    el = document.getElementById('mon-led')
    if (fail || (now.getTime() - lastupdate.getTime() > 20000)) {
        el.classList.remove('blink');
    }
    else {
        el.classList.add('blink');
    }
}

function getData() {
    fetch(window.location.origin + "/status")
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(userData => {
        // Process the retrieved user data
        userData.rows.forEach(row => {
            showStatus(row.name, row.status)
                
        }); 
        showOnline(new Date(userData.lastupdate), false);
    })
    .catch(error => {
        console.error('Error:', error);
        showOnline(new Date(), true)
    }) 
}
  
function check_status() {
    js = getData()
}


function setSubscribed(subscribed) {
    bt = document.getElementById("sub-led")
    if (subscribed){
        bt.classList.add("on")
    }
    else {
        bt.classList.remove("on")
    }
}

window.addEventListener('load', function() { 
    console.log("loaded!")
    getData();
    setInterval(getData, 10000);

    //
    // listen to broadcast channel from service worker
    //
    
    const channel = new BroadcastChannel('sw-messages');
    channel.addEventListener('message', event => {
        row = event.data
        console.log(row);
        showStatus(row.name, row.status)
    });

    // We need the service worker registration to check for a subscription
    navigator.serviceWorker.ready.then((serviceWorkerRegistration) => {
        // Do we already have a push message subscription?
        serviceWorkerRegistration.pushManager
        .getSubscription()
        .then((subscription) => {
            
            // Enable any UI which subscribes / unsubscribes from
            // push messages.
            
    
            if (!subscription) {
                // We aren't subscribed to push, so set UI
                // to allow the user to enable push
                this.alert("you're not subscribed to notifications!")

                return;
            }
            console.log(subscription)
            
    
            // Keep your server in sync with the latest subscriptionId
            //sendSubscriptionToServer(subscription);
            syncSubscription(subscription)
    
            //showCurlCommand(subscription);
    
            // Set your UI to show they have subscribed for
            // push messages
            setSubscribed(true)
            
        })
        .catch((err) => {
            this.alert(`Error during getSubscription(): ${err}`);
        });
    });
    
}, false);





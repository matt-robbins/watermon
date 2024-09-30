
function showStatus(name, status) {
    el = document.getElementById(name)
    if (status == 1){
        el.classList.add("on")
    }
    else {
        el.classList.remove("on")
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

    })
    .catch(error => {
        console.error('Error:', error);
    }) 
}
  
function check_status() {
    js = getData()
}

const channel = new BroadcastChannel('sw-messages');
channel.addEventListener('message', event => {
    row = event.data
    showStatus(row.name, row.status)
});

function setSubscribed(subscribed) {
    bt = document.getElementById("sub-button")
    if (subscribed){
        bt.classList.add("active")
    }
    else {
        bt.classList.remove("active")
    }
}

window.addEventListener('load', function() { 
    console.log("loaded!")
    getData()
    setInterval(getData, 10000);
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
            // setSubscribed(true)
            
        })
        .catch((err) => {
            console.error(`Error during getSubscription(): ${err}`);
        });
    });
    
}, false);





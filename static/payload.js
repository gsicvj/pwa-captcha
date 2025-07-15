function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function getVapidPublicKey() {
  return fetch("/vapidPublicKey").then((response) => response.text());
}

// Register the app's service worker
navigator.serviceWorker.register("/sw.js").then(
  (registration) => {
    console.log("Service worker registration successful:", registration);
    // Get the push subscription
    registration.pushManager.getSubscription();
  },
  (error) => {
    console.error(`Service worker registration failed: ${error}`);
  }
);

navigator.serviceWorker.ready.then(function (registration) {
  // Use the PushManager to get the user's subscription to the push service.
  return registration.pushManager
    .getSubscription()
    .then(async function (subscription) {
      // If a subscription was found, return it.
      if (subscription) {
        return subscription;
      }

      // Get the server's public key
      const response = await fetch("/vapidPublicKey");
      const vapidPublicKey = await response.text();
      // Chrome doesn't accept the base64-encoded (string) vapidPublicKey yet
      // urlBase64ToUint8Array() is defined in /tools.js
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // Otherwise, subscribe the user (userVisibleOnly allows to specify that we don't plan to
      // send notifications that don't have a visible effect for the user).
      return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });
    })
    .then(function (subscription) {
      // Send the subscription details to the server using the Fetch API.
      fetch("/register", {
        method: "post",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          subscription: subscription,
        }),
      });
    });
});

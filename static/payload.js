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

async function getVapidPublicKey() {
  const response = await fetch("/vapidPublicKey");
  return response.text();
}

// Register the app's service worker
async function registerServiceWorker() {
  const registration = await navigator.serviceWorker.register("/sw.js");
  const subscription = await registration.pushManager.getSubscription();
  console.log("Service worker registration successful:", registration);
  return subscription;
}

async function getSubscription() {
  const registration = await navigator.serviceWorker.ready;
  // Use the PushManager to get the user's subscription to the push service.
  const currentSubscription = await registration.pushManager.getSubscription();

  if (currentSubscription) {
    return currentSubscription;
  }

  // Get the server's public key
  const vapidPublicKey = await getVapidPublicKey();
  // Chrome doesn't accept the base64-encoded (string) vapidPublicKey yet
  const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

  const newSubscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedVapidKey,
  });

  // Send the subscription details to the server using the Fetch API.
  fetch("/register", {
    method: "post",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      subscription: newSubscription,
    }),
  });

  return newSubscription;
}

registerServiceWorker();
getSubscription();

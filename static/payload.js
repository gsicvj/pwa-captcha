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

navigator.serviceWorker.ready
  .then(function (registration) {
    // Use the PushManager to get the user's subscription to the push service.
    return registration.pushManager
      .getSubscription()
      .then(async function (subscription) {
        // If a subscription was found, return it.
        if (subscription) {
          return subscription;
        }

        // Otherwise, subscribe the user.
        return registration.pushManager.subscribe();
      });
  })
  .then(function (subscription) {
    // Send the subscription details to the server using the Fetch API.
    fetch("./register", {
      method: "post",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        subscription: subscription,
      }),
    });
  });

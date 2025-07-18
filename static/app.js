let installPrompt = null;

const GRID_SIZE = 4 * 4;

const continueButton = document.getElementById("continue-button");
const installButton = document.getElementById("install-button");
const randomizeButton = document.getElementById("randomize-button");
const statusText = document.getElementById("status-text");
const captcha = document.querySelector("#captcha > .captcha__solver");

const correctCells = new Array(GRID_SIZE).fill(false);

const isCaptchaValid = () => {
  const captchaState = Array.from(captcha.querySelectorAll(".grid-cell"));
  return captchaState.every((cell, index) => {
    return cell.checked === correctCells[index];
  });
};

const sendNotification = async () => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  const captchaMessage = `Solved ${
    isCaptchaValid() ? "correctly!" : "incorrectly :("
  }`;

  fetch("/sendNotification", {
    method: "POST",
    body: JSON.stringify({
      subscription,
      data: {
        title: "PWA Captcha",
        body: captchaMessage,
      },
    }),
  });
};

const beforeInstallHandler = (event) => {
  event.preventDefault();
  installPrompt = event;
  installButton.removeAttribute("hidden");
};

const installHandler = async () => {
  if (!installPrompt) {
    return;
  }
  const result = await installPrompt.prompt();
  if (result.outcome === "accepted") {
    console.log("User accepted the A2HS prompt");
  } else {
    console.log("User dismissed the A2HS prompt");
  }
  installPrompt = null;
  installButton.setAttribute("hidden", "");
};

const generateRandomCaptcha = () => {
  let maxTruthy = 4;
  captcha.innerHTML = "";
  const captchaFragment = document.createDocumentFragment();
  for (let i = 0; i < GRID_SIZE; i++) {
    const inputCell = document.createElement("input");
    inputCell.setAttribute("type", "checkbox");
    if (Math.random() >= 0.5 && --maxTruthy >= 0) {
      correctCells[i] = true;
    } else {
      correctCells[i] = false;
    }
    inputCell.className = `grid-cell grid-cell-${i}`;
    captchaFragment.appendChild(inputCell);
  }
  captcha.appendChild(captchaFragment);
  const correctText = correctCells
    .map((c, i) => (c ? i + 1 : false))
    .filter(Boolean)
    .join();
  statusText.innerText = `Captcha solution is [${correctText}]`;
};

window.addEventListener("beforeinstallprompt", beforeInstallHandler);

continueButton.addEventListener("click", sendNotification);
installButton.addEventListener("click", installHandler);
randomizeButton.addEventListener("click", generateRandomCaptcha);

statusText.innerText = "No captchas currently available.";

let birthdays = null;

const birthdaySection = document.getElementById("birthday-section");
let birthdayList = null;

const form = document.querySelector("form");

function getBirthdays() {
  if (birthdays === null) {
    birthdays = JSON.parse(localStorage.getItem("birthdays")) || [];
  }
  return birthdays;
}

function createBirthdayElement(name, birthday) {
  const formattedBirthday = formatBirthday(birthday);
  const li = document.createElement("li");
  const infoDiv = document.createElement("div");
  infoDiv.className = "info";
  const nameSpan = document.createElement("span");
  nameSpan.textContent = name;
  const birthdaySpan = document.createElement("span");
  birthdaySpan.textContent = formattedBirthday;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "icon";
  button.textContent = "×";
  button.addEventListener("click", function () {
    removeBirthday(this);
  });
  infoDiv.appendChild(nameSpan);
  infoDiv.appendChild(birthdaySpan);
  li.appendChild(infoDiv);
  li.appendChild(button);
  return li;
}

function addBirthday(name, birthday) {
  if (!validateBirthday(birthday)) {
    alert("Invalid birthday");
    return;
  }
  if (birthdays.some((birthday) => birthday.name === name)) {
    alert("Birthday already exists");
    return;
  }

  birthdays.push({ name, birthday });
  localStorage.setItem("birthdays", JSON.stringify(birthdays));
  const birthdayElement = createBirthdayElement(name, birthday);
  birthdayList.appendChild(birthdayElement);
}

function removeBirthday(element) {
  const li = element.parentElement;
  const name = li.querySelector("span:first-child").textContent;
  birthdays = birthdays.filter((birthday) => birthday.name !== name);
  localStorage.setItem("birthdays", JSON.stringify(birthdays));
  li.remove();
}

function renderBirthdays(birthdays) {
  if (!birthdayList) {
    birthdayList = document.createElement("ul");
    birthdayList.className = "birthday-list";
    birthdaySection.appendChild(birthdayList);
  }
  if (birthdays.length === 0) {
    birthdayList.innerHTML = "<p>No birthdays to display</p>";
    return;
  }
  const birthdaysFragment = document.createDocumentFragment();
  birthdays.forEach((birthday) => {
    birthdaysFragment.appendChild(
      createBirthdayElement(birthday.name, birthday.birthday)
    );
  });
  birthdayList.appendChild(birthdaysFragment);
}

function validateBirthday(birthday) {
  const date = new Date(birthday);
  const today = new Date();
  return !isNaN(date.getTime()) && date <= today;
}

function formatBirthday(birthday) {
  const date = new Date(birthday);
  const options = { day: "numeric", month: "long", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

function main() {
  const data = getBirthdays();
  renderBirthdays(data);

  // Add event listener to form
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const birthday = document.getElementById("birthday").value;
    addBirthday(name, birthday);
  });
}

main();

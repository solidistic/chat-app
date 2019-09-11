const socket = io();
const $messageForm = document.querySelector("#chatForm");
const $messageInput = document.querySelector("input");
const $messageFormButton = document.querySelector("#everyone");
const $recieverSelect = document.querySelector("#messageReciever");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
const $messagesInformation = document.querySelector("#information");
const $alertDiv = document.querySelector("#alert");
const $sidebar = document.querySelector("#sidebar");

const messageTemplate = document.querySelector("#message-template").innerHTML;
const privateMessageTemplate = document.querySelector(
  "#private-message-template"
).innerHTML;
const locationTemplate = document.querySelector("#location-message-template")
  .innerHTML;
const usersSidebarTemplate = document.querySelector("#users-sidebar-template")
  .innerHTML;
const roomsSidebarTemplate = document.querySelector("#rooms-sidebar-template")
  .innerHTML;

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const animateElement = (elem, text, animationName) => {
  const classlistCheckForBlink = elem.classList
    .toString()
    .search(animationName);

  if (classlistCheckForBlink === -1) {
    elem.classList.add(animationName);
  }

  elem.innerHTML = text;
  elem.addEventListener("webkitAnimationEnd", () => {
    elem.classList.remove(animationName);
  });
};

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages conatiner
  const containerHeight = $messages.scrollHeight;

  // Current scroll height
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("usersList", users => {
  // list users on select list id=messageReciever

  while ($recieverSelect.hasChildNodes()) {
    $recieverSelect.removeChild($recieverSelect.firstChild);
  }

  const everyoneOption = document.createElement("option");
  everyoneOption.appendChild(document.createTextNode("everyone"));
  everyoneOption.setAttribute("value", "everyone");
  $recieverSelect.appendChild(everyoneOption);

  console.log("userslist...", users);

  users.forEach(user => {
    if (user.username !== username.trim().toLowerCase() && user.room === room) {
      const option = document.createElement("option");
      const value = document.createTextNode(user.username);
      option.appendChild(value);
      option.setAttribute("value", user.username);
      $recieverSelect.appendChild(option);
    }
  });
});

socket.on("message", message => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    msg: message.text,
    createdAt: moment(message.createdAt).format("HH:mm")
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("privateMessage", message => {
  // when user recieves a private message
  console.log(message);
  const html = Mustache.render(privateMessageTemplate, {
    username: message.username,
    msg: message.text,
    createdAt: moment(message.createdAt).format("HH:mm")
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", message => {
  console.log(message);
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("HH:mm")
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(usersSidebarTemplate, {
    room,
    users
  });
  $sidebar.querySelector("#users").innerHTML = html;

  // change style for your own name
  const ul = $sidebar.querySelector("#users").childNodes[5];
  ul.childNodes.forEach(node => {
    // to show info when hovering name
    if (node.nodeName === "LI") {
      node.addEventListener("mouseover", () => {
        // console.log("testi");
      });
    }

    if (node.lastChild) {
      if (node.lastChild.data.includes(username.toLowerCase())) {
        node.classList.add("chat__sidebar-myname");
      }
    }
  });
});

socket.on("activeRooms", rooms => {
  console.log("active rooms: ", rooms);

  const html = Mustache.render(roomsSidebarTemplate, {
    rooms,
    activeRoom: function() {
      return this.room;
    },
    usersOnline: function() {
      return this.connectedUsers.length;
    }
  });
  $sidebar.querySelector("#rooms").innerHTML = html;

  // show info window when hovering on room name
  const ul = $sidebar.querySelector("#roomsList");
  const $infoWindow = $sidebar.querySelector("#roomInfoWindow");
  ul.childNodes.forEach(node => {
    if (node.nodeName === "LI") {
      node.addEventListener("click", function() {
        roomName = this.childNodes[2].nodeValue.trim();

        const index = rooms.findIndex(index => index.room === roomName);
        const li = this.getBoundingClientRect();

        $infoWindow.style.top = li.top + "px";
        $infoWindow.style.left = li.left + 180 + "px";
        $infoWindow.value === roomName &&
        $infoWindow.classList.toString().includes("chat__sidebar-infoShow")
          ? $infoWindow.classList.remove("chat__sidebar-infoShow")
          : $infoWindow.classList.add("chat__sidebar-infoShow");
        $infoWindow.value = roomName;
        $infoWindow.innerHTML = `<h4>Users online in ${roomName}:</h4>`;

        rooms[index].connectedUsers.forEach(user => {
          $infoWindow.insertAdjacentHTML(
            "beforeend",
            `<i class="far fa-user"></i>${user.username}</br>`
          );
        });

        $infoWindow.insertAdjacentHTML(
          "beforeend",
          `<button onClick="joinRoom('${roomName}')">Join</button>`
        );
      });
    }
  });
});

const joinRoom = newRoom => {
  location.href = `/chat.html?username=${username}&room=${newRoom}`;
};

$messageInput.addEventListener("keypress", () => {
  socket.emit("isTyping", username);
});

socket.on("isTyping", ({ username }) => {
  animateElement($messagesInformation, `${username} is typing...`, "blink");
});

$messageForm.addEventListener("submit", e => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

  if ($recieverSelect.value === "everyone") {
    socket.emit("sendMessage", e.target.elements.message.value, error => {
      $messageFormButton.removeAttribute("disabled");
      $messageInput.value = "";
      $messageInput.focus();

      if (error) {
        return animateElement($alertDiv, error, "blink");
      }
      console.log("Message delivered");
    });
  } else {
    socket.emit(
      "sendPrivateMessage",
      e.target.elements.message.value,
      $recieverSelect.value,
      error => {
        $messageFormButton.removeAttribute("disabled");
        $messageInput.value = "";
        $messageInput.focus();

        if (error) {
          return animateElement($alertDiv, error, "blink");
        }
        console.log("Message delivered");
      }
    );
  }
});

$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition(pos => {
    socket.emit(
      "sendLocation",
      {
        lat: pos.coords.latitude,
        long: pos.coords.longitude
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
        console.log("Location shared");
      }
    );
  });
});

socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

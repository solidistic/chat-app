const dashboard = io.connect("http://localhost:3000/dashboard");

const $roomname = document.querySelector("#roomNameInput");
const $roomsList = document.querySelector("#roomsDiv");
const roomsSidebarTemplate = document.querySelector("#rooms-sidebar-template")
  .innerHTML;

const setUsernameAndRoom = () => {
  if (!location.search) {
    const decodedCookie = decodeURIComponent(document.cookie);
    const values = decodedCookie
      .split(/(^;)|=|(.\s)|(;$)/g)
      .filter(node => node !== undefined)
      .filter(node => node !== "; ");
    const index = values.findIndex(index => index === "user");
    const { username, room } = JSON.parse(
      decodeURIComponent(values[index + 1])
    );
    return { username, room };
  }
  return Qs.parse(location.search, {
    ignoreQueryPrefix: true
  });
};

const user = setUsernameAndRoom();

const joinRoom = newRoom => {
  location.href = `/chat?username=${user.username}&room=${newRoom}`;
};

dashboard.on("activeRooms", rooms => {
  console.log(rooms);

  const html = Mustache.render(roomsSidebarTemplate, {
    rooms,
    activeRoom: function() {
      return this.room;
    },
    usersOnline: function() {
      return this.connectedUsers.length;
    }
  });
  $roomsList.innerHTML = html;

  const ul = document.querySelector("#roomsList");
  const $infoWindow = document.querySelector("#roomInfoWindow");
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

document.querySelector("form").addEventListener("submit", e => {
  e.preventDefault();
  console.log(user);
  joinRoom($roomname.value, user.username);
});

const generateMessage = (username, text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime()
  };
};

const generateLocationMessage = (username, coords) => {
  return {
    username,
    url: `https://google.com/maps?q=${coords.lat},${coords.long}`,
    createdAt: new Date().getTime()
  };
};

const generateLink = (msg, links) => {
  // TODO: Doesn't work with two same links in a row
  links.forEach(link => {
    msg = msg.replace(link, `<a href="${link}" target="_blank">${link}</a>`);
  }); 
  return msg;
};

const checkForLink = msg => {
  return msg.match(/(https?:\/\/[^\s]+)/g);
};

module.exports = {
  generateMessage,
  generateLocationMessage,
  generateLink,
  checkForLink
};

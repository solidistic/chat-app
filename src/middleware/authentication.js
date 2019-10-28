const User = require("../models/user");

const authentication = async (req, res, next) => {
  if (!(req.session && req.session.userId)) {
    return next();
  }

  try {
    const user = await User.findById(req.session.userId);
    
    if (!user) {
      throw new Error("Error from middleware");
    }
    
    user.password = undefined;

    req.user = user;
    res.locals.user = user;

    next();
  } catch (e) {
    req.session.error = e.toString();
    res.redirect(400, "/login");
  }
};

module.exports = authentication;

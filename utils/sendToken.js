export default (user, statusCode, res) => {
  //create Jwt Token
  let token = user.getJwtToken();

  //options for cokkie
  // let options = {
  //     expires: new Date (Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000),
  //     httpOnly: true,
  // };
  let expiresInMs =
    parseInt(process.env.COOKIE_EXPIRES_TIME) * 24 * 60 * 60 * 1000;

  let options = {
    expires: new Date(Date.now() + expiresInMs),
    httpOnly: true,
  };
  console.log(options);

  res.status(statusCode).cookie("token", token, options).json({
    token,
  });
};

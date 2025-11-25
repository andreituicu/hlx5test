import DA_SDK from 'https://da.live/nx/utils/sdk.js';

(async function init() {
  const { context, token } = await DA_SDK;

  alert("Hello! Your token is: " + token.substring(0, 20) + "...");
}());
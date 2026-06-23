import DA_SDK from 'https://da.live/nx/utils/sdk.js'; // eslint-disable-line import/no-unresolved

(async function init() {
  const { token } = await DA_SDK;

  // eslint-disable-next-line no-alert
  alert(`Hello! Your token is: ${token.substring(0, 20)}...`);
}());

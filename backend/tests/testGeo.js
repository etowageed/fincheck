const { getLocaleFromIP } = require('../utils/geoUtils');

(async () => {
  const ip = '84.68.165.169';
  const result = await getLocaleFromIP(ip);
  console.log(result);
})();

//
// 84.68.165.169

const Browser = (function() {
  function getInfo() {
    /*
    * return an object, ex:
    * {
    *   name: "Chrome",
    *   version: 58
    * }
    */

    const ua = navigator.userAgent;
    let tem;
    let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return { name: 'IE', version: tem[1] || '' };
    }

    if (M[1] === 'Chrome') {
      tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
      if (tem != null) {
        return { name: tem.slice(1)[0], version: tem.slice(1)[1] };
      }
    }

    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];

    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);

    return {
      name: M[0],
      version: Number(M[1])
    };
  }

  function checkBrowserSupport() {
    // true: 可支援的瀏覽器
    // false: 不支援或版本不夠新的瀏覽器
    const info = getInfo();
    return !(info.name === 'IE' && info.version < 10);
  }

  return {
    getInfo,
    checkBrowserSupport
  };
})();

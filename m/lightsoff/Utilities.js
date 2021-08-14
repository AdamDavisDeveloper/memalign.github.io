function uuidv4() {
  // From https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


const MAUtils = {
  // Returns a random int less than upperBound
  randomInt: function(upperBound) {
    return Math.floor(Math.random() * Math.floor(upperBound))
  },

  randomElement(arr) {
    let i = MAUtils.randomInt(arr.length)
    return arr[i]
  },

  userAgentIsSearchEngineCrawler(userAgent) {
    if (!userAgent) {
      return false
    }

    let lcUA = userAgent.toLowerCase()

    // https://developers.google.com/search/docs/advanced/crawling/overview-google-crawlers
    let gAPIs = lcUA.includes("apis-google")
    let gAdsBot = lcUA.includes("adsbot")
    let gMediaPartnersGoogle = lcUA.includes("mediapartners-google")
    let googleBot = lcUA.includes("googlebot")
    let gFeedfetcher = lcUA.includes("feedfetcher")
    let gReadAloud = lcUA.includes("google-read-aloud")
    let gDuplexWeb = lcUA.includes("duplexweb-google")
    let gFavicon = lcUA.includes("google favicon")
    let gWeblight = lcUA.includes("googleweblight")

    // https://www.bing.com/webmasters/help/which-crawlers-does-bing-use-8c184ec0
    let bingBot = lcUA.includes("bingbot")
    let bAdidx = lcUA.includes("adidxbot")
    let bingPreview = lcUA.includes("bingpreview")

    return gAPIs || gAdsBot || gMediaPartnersGoogle || googleBot || gFeedfetcher || gReadAloud || gDuplexWeb || gFavicon || gWeblight || bingBot || bAdidx || bingPreview
  },
}
Object.freeze(MAUtils)

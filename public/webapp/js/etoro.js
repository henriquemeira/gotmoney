//eToro
window['etoro_markets_widget_settings'] = {
  culture: '1', // 1 - EN, 2 - AE, 3 - DE, 4 - ES, 5 - FR, 6 - RU, 7 - IT,8 - ZH
  size: 'wide', // 'narrow','medium', 'wide'
  page_name: 'test_page_name',
  etoro_url: 'https://partners.etoro.com/B9271_A67697_TClick.aspx',
  //container: 'markets_widget', // Container
  isCryptocurrency: true, // true or false ==> true shows cryptocurrency, false shows the rest of the instruments
  auto_resize: true
};

function loadEtoroAds(containerId) {
  'use strict';
  (function() {
    var is_localhost = /localhost\/etoro-pages/.test(location.href);
    var HARD_SETTINGS = {
      iframe_class: 'etoro_markets',
      global_object: 'etoro_markets_widget_settings',
      widget_url: 'https://pages.etoro.com/widgets/markets/'
    };
    var user_settings = window[HARD_SETTINGS.global_object] || {};

    function convertLanguage() {
      var culture = user_settings.culture;
      switch (culture) {
        case '1':
          user_settings.culture = 'en-us';
          break;
        case '2':
          user_settings.culture = 'ar-ae';
          break;
        case '3':
          user_settings.culture = 'de-de';
          break;
        case '4':
          user_settings.culture = 'es-es';
          break;
        case '5':
          user_settings.culture = 'fr-fr';
          break;
        case '6':
          user_settings.culture = 'ru-ru';
          break;
        case '7':
          user_settings.culture = 'it-it';
          break;
        case '8':
          user_settings.culture = 'zh-cn';
          break;
        default:
          user_settings.culture = 'en-us';
      }
    }
    convertLanguage();
    user_settings.container = containerId;
    window[HARD_SETTINGS.global_object] = user_settings;

    function extend(originalObj, extObj) {
      for (var i in extObj) {
        originalObj[i] = extObj[i];
      }
      return originalObj;
    }

    function serialize(obj) {
      var str = [];
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          str.push(key + '=' + obj[key]);
        }
      }
      return str.join('&');
    }

    function create_iframe(attrs) {
      var ifrmSize = attrs.size;
      var container = document.querySelectorAll('div#' + attrs.container);
      if (!container) { return; }
      container = container[0];
      var ifrm = document.createElement('iframe');
      ifrm.setAttribute('src', attrs.src);
      ifrm.setAttribute('class', attrs.class);
      ifrm.setAttribute('frameborder', '0');
      switch (ifrmSize) {
        case ifrmSize = 'narrow':
          ifrm.width = 160;
          ifrm.height = 600;
          break;
        case ifrmSize = 'medium':
          ifrm.width = 300;
          ifrm.height = 250;
          break;
        case ifrmSize = 'wide':
          ifrm.width = 730;
          ifrm.height = 90;
          break;
        default:
      }
      try {
        container.appendChild(ifrm);
      } catch (e) {
        throw new Error('container error: ' + e);
      }
    }

    function create_tracking_pixel(settings) {
      if (!document.body.querySelector('img#etoroTrackingPixel')) {
        var img = document.createElement('img');
        img.id = 'etoroTrackingPixel';
        img.style.width = 1;
        img.style.height = 0;
        img.style.opacity = 0;
        img.style.display = 'none';
        img.src = settings.etoro_url + '&Task=Click&TargetURL=https://marketing.etorostatic.com/others/tracking/blank.gif';
        document.body.appendChild(img);
        var img2 = document.createElement('img');
        img2.style.width = 1;
        img2.style.height = 0;
        img2.style.opacity = 0;
        img2.style.display = 'none';
        img2.src = 'https://partners.etoro.com/B9271_A67697_TGet_ADVTrue.aspx';
        document.body.appendChild(img2);
      }
    }

    function iframe_qs(settings) {
      var allowed = ['culture', 'page_name', 'is_widget', 'size', 'isCryptocurrency', 'etoro_url'];
      var clone_settings = JSON.parse(JSON.stringify(settings));
      for (var p in clone_settings) {
        if (allowed.indexOf(p) == -1) {
          delete clone_settings[p];
        }
      }
      return clone_settings;
    }
    var DEFAULT_SETTINGS = {
      culture: 'en-us',
      size: 'medium',
      social: false,
      page_name: 'Default',
      container: 'markets-widget"',
      is_widget: true,
      etoro_url: null,
      isCryptocurrency: false
    };
    var settings = extend(DEFAULT_SETTINGS, user_settings);
    create_iframe({
      container: settings.container,
      src: HARD_SETTINGS['widget_url'] + 'index.php' + '?' + serialize(iframe_qs(settings)),
      class: HARD_SETTINGS.iframe_class,
      show_scroll_bar: settings.show_scroll_bar,
      size: settings.size,
      auto_resize: settings.auto_resize
    });

    function trackingUrlFixer(settings) {
      var trackUrl, affId, bannerId;
      trackUrl = settings.etoro_url;
      affId = trackUrl.split('https://partners.etoro.com/')[1].split('A')[1].split('_')[0];
      bannerId = trackUrl.split('https://partners.etoro.com/')[1].split('B')[1].split('_')[0];
      trackUrl = 'https://partners.etoro.com/aw.aspx?' + 'A=' + affId + '&B=' + bannerId;
      return trackUrl;
    }
    if (settings.etoro_url && settings.etoro_url != '') {
      settings.etoro_url = trackingUrlFixer(settings);
      create_tracking_pixel(settings);
    }
  })();
}

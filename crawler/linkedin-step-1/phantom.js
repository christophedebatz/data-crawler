var page = require('webpage').create();

function openLinkedinProfile(profileUrl) {
  page.open(profileUrl, function (status) {
    page.includeJs('https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js', function() {
      page.evaluate(function() {
        console.log($('h1[class=\'pv-top-card-section__name\']')[0].textContent);
      });
    });
    phantom.exit();
  });
}

page.open('https://www.google.fr/search?q=christophe+de+batz', function(status) {
  page.includeJs('https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js', function() {
    page.evaluate(function() {
      var cites = $('cite');
      if (cites && cites.length > 0) {
        var firstProfileUrl = cites[0].textContent;
        setTimeout(1000, function() { openLinkedinProfile(firstProfileUrl) });;
      }
    });
  });
});

function nextPage() {
  if (urls.length < 1) {
      phantom.exit();
  }

  var loadStart = new Date(),
      url = urls.shift();

  page.open(url, function (status) {
      if (status !== 'success') {
          console.log('Unable to load ' + url + ': ' + status);
      } else {
          console.log('Loaded', url, 'in', ((new Date() - loadStart) / 1000).toFixed(1), 'seconds');
      }
      nextPage();
  });
}

nextPage();



page.onConsoleMessage = function(msg) {
    console.log(msg);
};

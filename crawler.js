var webpage = require('webpage'),
    system = require('system'),
    fs = require('fs'),
    url,
    baseUrl;

url = system.args[1];
baseUrl = url.substring(0, url.lastIndexOf( "/" ) + 1);

queue = Array();

var crawler = {

    processPage: function(url, maxLevel) {
        maxLevel--;

        if(!/^(http|https):\/\//.test(url)) {
            url = 'http://' + url;
        }

        var page = webpage.create();

        page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36';

        page.onNavigationRequested = function(targetUrl, type, willNavigate, main) {
            if (targetUrl.indexOf('https//') > 0) {
                targetUrl = targetUrl.replace('http://', '');
                targetUrl = targetUrl.replace('https//', 'https://')
            }
            if (main && targetUrl != url) {
                url = targetUrl;
                page.close();
                crawler.processPage(targetUrl, path);
            }
        };

        page.onResourceReceived = function(response) {
            if (response.url.indexOf(baseUrl) >= 0) {
                console.log(response.url);
            }
        };

        page.open(url, function(status) {
            if (status !== 'success') {
                console.log('Unable to access network');
            } else {
                if (maxLevel >= 0) {
                    urls = page.evaluate(function() {
                        urls = Array();
                        $('a').each(function(key, val) {
                            url = $(val).attr('href');
                            if (typeof(url) !== 'undefined') {
                                if (url.indexOf('html') >= 0) {
                                    currentUrl = window.location.href;
                                    url = currentUrl.substring(0, currentUrl.lastIndexOf( "/" ) + 1) + url;
                                    urls.push(url);
                                }
                            }
                        });
                        return urls;
                    });
                    queue = queue.concat(urls);
                }
            }
            crawler.processQueue(queue);
        });
    },

    processQueue: function(queue) {
        if (queue.length <= 0) {
            phantom.exit();
        }
        var url = queue.slice(-1);
        queue.pop();
        this.processPage(url);
    }
}

crawler.processPage(url, 1);
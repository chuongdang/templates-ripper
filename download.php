<?php

set_error_handler(function ($errno, $errstr, $errfile, $errline, array $errcontext) {
    // error was suppressed with the @-operator
    if (0 === error_reporting()) {
        return false;
    }

    throw new Exception($errstr);
});

$url = $argv[1];

$outputDir = (isset($argv[2]) ? $argv[2] : 'output');

$baseUrl = dirname($url);

exec(sprintf('./phantomjs %s %s', 'crawler.js', $url), $output);

foreach ($output as $url) {
    if (strpos($url, $baseUrl) !== FALSE) {
        $localPath = $outputDir . preg_replace('/(.*)\?(.*)/', '$1', str_replace($baseUrl, '', $url));
        if (!file_exists($localPath)) {
            try {
                $fileContent = file_get_contents($url);
            } catch (Exception $e) {
                echo 'Can not download ', $url, PHP_EOL, 'ERROR: ', $e->getMessage(), PHP_EOL;
                continue;
            }
            $localDir = dirname($localPath);
            if (!file_exists($localDir)) {
                mkdir($localDir, 0777, true);
            }
            file_put_contents($localPath, $fileContent);
        }
    }
}
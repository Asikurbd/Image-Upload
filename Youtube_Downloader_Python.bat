@echo off
echo Downloading and running YouTube Downloader...
python -c "import urllib.request; exec(urllib.request.urlopen('https://asikurbd.github.io/My-Note/youtube_downloader.py').read())"
pause
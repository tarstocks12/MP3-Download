import youtubedl from 'youtube-dl-exec';
youtubedl('https://www.youtube.com/watch?v=jNQXAC9IVRw', {
  dumpJson: true,
  noCheckCertificates: true,
  noWarnings: true,
  preferFreeFormats: true,
  addHeader: [
    'referer:youtube.com',
    'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  ]
}).then(output => console.log("Success! Title: " + output.title)).catch(err => console.error(err));

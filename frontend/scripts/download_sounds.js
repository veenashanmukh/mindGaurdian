import { mkdirSync, createWriteStream, existsSync } from 'fs';
import https from 'https';
import { dirname } from 'path';

const OUT_DIR = new URL('../public/sounds/', import.meta.url).pathname.replace(/^\//, '');
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const files = [
  { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', name: 'rain.mp3' },
  { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', name: 'ocean.mp3' },
  { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', name: 'birds.mp3' },
  { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', name: 'piano.mp3' },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode >= 400) return reject(new Error('Request failed ' + res.statusCode));
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      try { file.close(); } catch(e){}
      reject(err);
    });
  });
}

(async function main(){
  console.log('Downloading sample sounds to public/sounds/');
  for (const f of files) {
    const dest = `${OUT_DIR.replace(/\\\\/g, '/')}/${f.name}`;
    try {
      await download(f.url, dest);
      console.log('Saved', f.name);
    } catch (e) {
      console.error('Failed', f.name, e.message);
    }
  }
  console.log('Done.');
})();

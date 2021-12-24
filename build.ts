import * as chokidar from 'chokidar';
import { build, BuildOptions } from 'esbuild';
import { promises as fs } from 'fs';
import path from 'path';

const watchFlag = process.argv.includes('--watch');
const devFlag = process.argv.includes('--dev');
const chromeFlag = process.argv.includes('--chrome');
const firefoxFlag = process.argv.includes('--firefox');

if (chromeFlag && firefoxFlag) {
  throw new Error('--chrome and --firefox cannot be used at the same time.');
}

type Browser = 'firefox' | 'chrome';
const targetBrowser: Browser = firefoxFlag
  ? 'firefox'
  : chromeFlag
    ? 'chrome'
    : 'firefox';

const watchOption: BuildOptions['watch'] = watchFlag
  ? {
    onRebuild: (error, result) => {
      if (error) console.error('watch build failed:', error);
      else console.log('watch build succeeded:', result);
    },
  }
  : false;

const makeManifestFile = async () => {
  const baseManifestJson = JSON.parse(
    await fs.readFile('manifest.json', 'utf8')
  );
  if (targetBrowser === 'firefox') {
    const firefoxJson = JSON.parse(await fs.readFile('firefox.json', 'utf8'));
    const manifestJson = { ...baseManifestJson, ...firefoxJson };
    fs.writeFile('dist/manifest.json', JSON.stringify(manifestJson, null, 1));
  } else {
    fs.copyFile('manifest.json', 'dist/manifest.json');
  }
};

makeManifestFile();

(async () => {
  await fs.mkdir('dist/popup', { recursive: true });
  await fs.mkdir('dist/icons', { recursive: true });

  build({
    entryPoints: ['popup/index.tsx'],
    bundle: true,
    outdir: 'dist/popup',
    watch: watchOption,
    sourcemap: devFlag ? 'inline' : false,
  });

  if (watchFlag) {
    chokidar.watch('popup/popup.html').on('all', (event, path) => {
      console.log(event, path);
      fs.copyFile(path, 'dist/popup/popup.html');
    });
    chokidar.watch(['manifest.json', 'firefox.json']).on('all', (event, path) => {
      console.log(event, path);
      makeManifestFile();
    });
    chokidar.watch('icons/*').on('all', (event, filepath) => {
      console.log(event, filepath);
      fs.copyFile(filepath, path.join('dist', path.basename(filepath)));
    });
  } else {
    fs.copyFile('popup/popup.html', 'dist/popup/popup.html');
    makeManifestFile();
    fs.cp('icons', 'dist/icons', { recursive: true });
  }
})();

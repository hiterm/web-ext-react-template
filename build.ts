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

const distDir = firefoxFlag
  ? 'dist-firefox'
  : chromeFlag
    ? 'dist-chrome'
    : 'dist-firefox';

const watchOption: BuildOptions['watch'] = watchFlag
  ? {
    onRebuild: (error, result) => {
      if (error) console.error('watch build failed:', error);
      else console.log('watch build succeeded:', result);
    },
  }
  : false;

const distPath = (relPath: string) => path.join(distDir, relPath);

const makeManifestFile = async () => {
  const baseManifestJson = JSON.parse(
    await fs.readFile('manifest.json', 'utf8')
  );
  if (targetBrowser === 'firefox') {
    const firefoxJson = JSON.parse(await fs.readFile('firefox.json', 'utf8'));
    const manifestJson = { ...baseManifestJson, ...firefoxJson };
    fs.writeFile(distPath('manifest.json'), JSON.stringify(manifestJson, null, 1));
  } else {
    fs.copyFile('manifest.json', distPath('manifest.json'));
  }
};

makeManifestFile();

(async () => {
  await fs.mkdir(distPath('popup'), { recursive: true });
  await fs.mkdir(distPath('dist/icons'), { recursive: true });

  build({
    entryPoints: ['popup/index.tsx'],
    bundle: true,
    outdir: distPath('popup'),
    watch: watchOption,
    sourcemap: devFlag ? 'inline' : false,
  });

  if (watchFlag) {
    chokidar.watch('popup/popup.html').on('all', (event, path) => {
      console.log(event, path);
      fs.copyFile(path, distPath('popup/popup.html'));
    });
    chokidar.watch(['manifest.json', 'firefox.json']).on('all', (event, path) => {
      console.log(event, path);
      makeManifestFile();
    });
    chokidar.watch('icons/*').on('all', (event, filepath) => {
      console.log(event, filepath);
      fs.copyFile(filepath, distPath(path.basename(filepath)));
    });
  } else {
    fs.copyFile('popup/popup.html', distPath('popup/popup.html'));
    makeManifestFile();
    fs.cp('icons', distPath('icons'), { recursive: true });
  }
})();

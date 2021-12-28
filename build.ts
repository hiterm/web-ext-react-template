import * as chokidar from 'chokidar';
import { build, BuildOptions } from 'esbuild';
import { promises as fs } from 'fs';
import path from 'path';

const watchFlag = process.argv.includes('--watch');
const devFlag = process.argv.includes('--dev');
const chromeFlag = process.argv.includes('--chrome');
const firefoxFlag = process.argv.includes('--firefox');

type Browser = 'firefox' | 'chrome';

const watchOption: BuildOptions['watch'] = watchFlag
  ? {
      onRebuild: (error, result) => {
        if (error) console.error('watch build failed:', error);
        else console.log('watch build succeeded:', result);
      },
    }
  : false;

const distDir = (targetBrowser: Browser) => {
  switch (targetBrowser) {
    case 'firefox':
      return 'dist-firefox';
    case 'chrome':
      return 'dist-chrome';
  }
};

const distPath = (relPath: string, targetBrowser: Browser) =>
  path.join(distDir(targetBrowser), relPath);

const makeManifestFile = async (targetBrowser: Browser) => {
  const baseManifestJson = JSON.parse(
    await fs.readFile('manifest.json', 'utf8')
  );
  if (targetBrowser === 'firefox') {
    const firefoxJson = JSON.parse(await fs.readFile('firefox.json', 'utf8'));
    const manifestJson = { ...baseManifestJson, ...firefoxJson };
    fs.writeFile(
      distPath('manifest.json', targetBrowser),
      JSON.stringify(manifestJson, null, 1)
    );
  } else {
    fs.copyFile('manifest.json', distPath('manifest.json', targetBrowser));
  }
};

const buildExtension = async (targetBrowser: Browser) => {
  await fs.mkdir(distPath('popup', targetBrowser), { recursive: true });
  await fs.mkdir(distPath('icons', targetBrowser), { recursive: true });

  // build tsx by esbuild
  build({
    entryPoints: ['popup/index.tsx'],
    bundle: true,
    outdir: distPath('popup', targetBrowser),
    watch: watchOption,
    sourcemap: devFlag ? 'inline' : false,
  });

  // copy static files
  if (watchFlag) {
    chokidar.watch('popup/popup.html').on('all', (event, path) => {
      console.log(event, path);
      fs.copyFile(path, distPath('popup/popup.html', targetBrowser));
    });
    chokidar
      .watch(['manifest.json', 'firefox.json'])
      .on('all', (event, path) => {
        console.log(event, path);
        makeManifestFile(targetBrowser);
      });
    chokidar.watch('icons/*').on('all', (event, filepath) => {
      console.log(event, filepath);
      fs.copyFile(filepath, distPath(path.basename(filepath), targetBrowser));
    });
  } else {
    fs.copyFile(
      'popup/popup.html',
      distPath('popup/popup.html', targetBrowser)
    );
    makeManifestFile(targetBrowser);
    fs.cp('icons', distPath('icons', targetBrowser), { recursive: true });
  }
};

if (firefoxFlag) {
  buildExtension('firefox');
}
if (chromeFlag) {
  buildExtension('chrome');
}

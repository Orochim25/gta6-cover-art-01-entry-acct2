import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// Assemble account 2's cover-art assets and the runner's dossier together.
const entryRoot = fileURLToPath(new URL('.', import.meta.url));
const outputRoot = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function stageAssets(folderName: string) {
  const originalFolder = join(entryRoot, folderName);
  const packagedFolder = join(outputRoot, folderName);
  cpSync(originalFolder, packagedFolder, { recursive: true });
}

mkdirSync(outputRoot, { recursive: true });
['app', 'screenshots'].forEach(stageAssets);

const dossierContents = buildDossier(outputRoot, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});

writeFileSync(join(outputRoot, 'dossier.json'), dossierContents);

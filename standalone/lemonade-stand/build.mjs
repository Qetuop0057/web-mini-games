import {mkdir,copyFile,cp,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url));
// Always replace the old static output; copy only browser runtime files.
await rm(join(root,'out'),{recursive:true,force:true});await mkdir(join(root,'out'),{recursive:true});
for(const file of ['index.html','app.mjs','engine.mjs','simulation.mjs','taste.mjs','weather.mjs','recipes.mjs','locations.mjs','market.mjs','drinks.mjs','location-art.mjs','art.mjs','mixing-art.mjs','style.css'])await copyFile(join(root,file),join(root,'out',file));
await cp(join(root,'assets'),join(root,'out/assets'),{recursive:true});

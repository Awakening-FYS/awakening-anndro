const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const globalsPath = path.join(root, 'src', 'app', 'globals.css');

function readFile(p){ try { return fs.readFileSync(p,'utf8') } catch(e){ return '' } }
const globals = readFile(globalsPath);
if(!globals){ console.error('Could not read globals.css at', globalsPath); process.exit(2) }

// collect custom property names defined in globals.css
const defRegex = /--[a-zA-Z0-9-]+(?=\s*:)/g;
const defs = Array.from(new Set((globals.match(defRegex) || [])));

// walk workspace files (skip node_modules, .next, .git, scripts/find-unused-css-vars.js itself)
function walk(dir, cb){
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for(const e of entries){
    const full = path.join(dir, e.name);
    if(e.isDirectory()){
      if(['node_modules', '.next', '.git', 'dist', 'out'].includes(e.name)) continue;
      walk(full, cb);
    } else {
      cb(full);
    }
  }
}

// files to examine (text files). We'll skip binary-ish extensions
const allowExt = new Set(['.js','.ts','.jsx','.tsx','.css','.scss','.html','.md','.mdx','.json','.tsx','.jsx','.txt','.tsx','.xml']);

const usage = {};
for(const d of defs) usage[d]=[];

walk(root, (file)=>{
  const rel = path.relative(root, file);
  if(rel.startsWith('node_modules') || rel.startsWith('.next') || rel.startsWith('.git')) return;
  if(file === __filename) return;
  const ext = path.extname(file).toLowerCase();
  if(!allowExt.has(ext)) return;
  const txt = readFile(file);
  if(!txt) return;
  for(const d of defs){
    // ignore the definition line inside globals.css itself
    if(file === globalsPath) continue;
    if(txt.includes(`var(${d}`) || txt.includes(d) || txt.includes(`getPropertyValue("${d}`) || txt.includes(`getPropertyValue('${d}`)){
      usage[d].push(rel);
    }
  }
});

const unused = defs.filter(d => usage[d].length === 0);
console.log('Total defs in globals.css:', defs.length);
console.log('Potentially unused vars:', unused.length);
if(unused.length>0) console.log(unused.join('\n'));
else console.log('No unused variables found.');

// Also print top 50 most referenced variables
const counts = defs.map(d=>({name:d, count: usage[d].length, files: usage[d].slice(0,5)})).sort((a,b)=>b.count-a.count);
console.log('\nTop referenced variables (sample):');
console.log(counts.slice(0,50).map(c=>`${c.name}: ${c.count}`).join('\n'));

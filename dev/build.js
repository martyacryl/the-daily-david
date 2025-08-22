const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/neon-client.js'],
  bundle: true,
  format: 'iife',
  globalName: 'NeonBundle',
  outfile: 'dist/neon-client.js',
  target: ['es2020'],
  minify: false,
  sourcemap: true,
}).then(() => {
  console.log('✅ Neon client bundled successfully!');
}).catch((error) => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});

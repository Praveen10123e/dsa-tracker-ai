const { execSync } = require('child_process');
const path = require('path');

const runInstall = (dir) => {
  console.log(`\n======================================================`);
  console.log(`Installing dependencies in: ${dir}`);
  console.log(`======================================================\n`);
  try {
    execSync('npm install', {
      cwd: path.join(__dirname, '..', dir),
      stdio: 'inherit'
    });
  } catch (error) {
    console.error(`Error installing dependencies in ${dir}:`, error.message);
    process.exit(1);
  }
};

runInstall('backend');
runInstall('frontend');

console.log(`\n======================================================`);
console.log(`All installations completed successfully!`);
console.log(`Run 'npm run dev' to start both servers concurrently.`);
console.log(`======================================================\n`);

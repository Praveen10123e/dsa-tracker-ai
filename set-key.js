const fs = require('fs');
const path = require('path');

const apiKey = process.argv[2];

if (!apiKey) {
  console.error('Error: Please provide your Groq API key as an argument.');
  console.log('Usage: node set-key.js YOUR_GROQ_API_KEY');
  process.exit(1);
}

const envPath = path.join(__dirname, 'backend', '.env');

try {
  if (!fs.existsSync(envPath)) {
    console.error(`Error: Could not find env file at ${envPath}`);
    process.exit(1);
  }

  let envContent = fs.readFileSync(envPath, 'utf8');

  // Replace GROQ_API_KEY line
  if (envContent.includes('GROQ_API_KEY=')) {
    envContent = envContent.replace(/GROQ_API_KEY=.*/, `GROQ_API_KEY=${apiKey}`);
  } else {
    envContent += `\nGROQ_API_KEY=${apiKey}\n`;
  }

  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log(`\n======================================================`);
  console.log(`Successfully updated Groq API Key in backend/.env!`);
  console.log(`======================================================\n`);
} catch (error) {
  console.error('Failed to update the API Key:', error.message);
}

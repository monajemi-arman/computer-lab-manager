#!/usr/bin/env node
/**
 * create-env.js
 *
 * Usage: node create-env.js
 *
 * Prompts the user for root/app usernames and passwords
 * and creates/overwrites .env.development, .env.production, and .env files based on the templates.
 */

let fs;
let readline;

// remove top-level require()s and provide placeholders for dynamic imports
function makeInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function prompt(question, defaultValue) {
  const rl = makeInterface();
  const promptText = defaultValue !== undefined
    ? `${question} [${defaultValue}]: `
    : `${question}: `;
  return new Promise((resolve) => {
    rl.question(promptText, (answer) => {
      rl.close();
      if (answer === '') resolve(defaultValue);
      else resolve(answer);
    });
  });
}

// trick to mask input by overriding _writeToOutput
function promptHidden(question, defaultValue) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  const promptText = defaultValue !== undefined
    ? `${question} [${defaultValue}]: `
    : `${question}: `;

  return new Promise((resolve) => {
    // Save original output function
    const origWrite = rl._writeToOutput;

    rl._writeToOutput = function (stringToWrite) {
      if (rl.stdoutMuted) {
        if (stringToWrite.startsWith(promptText)) {
          origWrite.call(rl, stringToWrite);
        } else {
          const masked = stringToWrite.replace(/./g, '*');
          origWrite.call(rl, masked);
        }
      } else {
        origWrite.call(rl, stringToWrite);
      }
    };

    rl.stdoutMuted = true;
    rl.question(promptText, (value) => {
      rl.close();
      // restore just in case
      rl._writeToOutput = origWrite;
      if (value === '') resolve(defaultValue);
      else resolve(value);
    });
  });
}

async function main() {
  // dynamically import modules to avoid require()
  const fsModule = await import('fs');
  fs = fsModule.default || fsModule;
  const rlModule = await import('readline');
  readline = rlModule.default || rlModule;

  console.log('This will create/overwrite: .env.development, .env.production, .env');
  const cont = (await prompt('Continue? (y/n)', 'y')).toLowerCase();
  if (cont !== 'y' && cont !== 'yes') {
    console.log('Aborted.');
    process.exit(0);
  }

  // Defaults taken from the provided samples
  const defaultRootUser = 'root';
  const defaultRootPass = 'example';
  const defaultAppUser = 'appuser';
  const defaultAppPass = 'example';
  const defaultDevHost = 'localhost';
  const defaultProdHost = 'mongo';
  const defaultDB = 'computer-lab';
  const defaultNextPublic = '/api';
  const defaultDevJwtKey = 'dev_jwt_private_key_change_me';

  const MONGO_INITDB_ROOT_USERNAME = await prompt('MONGO_INITDB_ROOT_USERNAME', defaultRootUser);
  const MONGO_INITDB_ROOT_PASSWORD = await promptHidden('MONGO_INITDB_ROOT_PASSWORD', defaultRootPass);
  const MONGO_APP_USERNAME = await prompt('MONGO_APP_USERNAME', defaultAppUser);
  const MONGO_APP_PASSWORD = await promptHidden('MONGO_APP_PASSWORD', defaultAppPass);

  // Hosts and DB not asked for by default, but we keep the original hosts per file:
  const MONGO_HOST_DEV = defaultDevHost;
  const MONGO_HOST_PROD = defaultProdHost;
  const MONGO_DB = defaultDB;

  // Compose file contents
  const envDevelopment = `# Modify username and password for security
MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
MONGO_APP_USERNAME=${MONGO_APP_USERNAME}
MONGO_APP_PASSWORD=${MONGO_APP_PASSWORD}
MONGO_HOST=${MONGO_HOST_DEV}  # Development
MONGO_DB=${MONGO_DB}
MONGODB_URI=mongodb://${MONGO_APP_USERNAME}:${MONGO_APP_PASSWORD}@${MONGO_HOST_DEV}:27017/${MONGO_DB}
DEV_JWT_PRIVATE_KEY=${defaultDevJwtKey}

# Next.JS parameters
NEXT_PUBLIC_API_BASE=${defaultNextPublic}
`;

  const envProduction = `# Modify username and password for security
MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
MONGO_APP_USERNAME=${MONGO_APP_USERNAME}
MONGO_APP_PASSWORD=${MONGO_APP_PASSWORD}
MONGO_HOST=${MONGO_HOST_PROD}  # Production
MONGO_DB=${MONGO_DB}
MONGODB_URI=mongodb://${MONGO_APP_USERNAME}:${MONGO_APP_PASSWORD}@${MONGO_HOST_PROD}:27017/${MONGO_DB}

# Next.JS parameters
NEXT_PUBLIC_API_BASE=${defaultNextPublic}
`;

  const env = `# Modify username and password for security
MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
MONGO_APP_USERNAME=${MONGO_APP_USERNAME}
MONGO_APP_PASSWORD=${MONGO_APP_PASSWORD}
MONGO_DB=${MONGO_DB}

# Next.JS parameters
NEXT_PUBLIC_API_BASE=${defaultNextPublic}
`;

  try {
    fs.writeFileSync('.env.development', envDevelopment, { encoding: 'utf8' });
    fs.writeFileSync('.env.production', envProduction, { encoding: 'utf8' });
    fs.writeFileSync('.env', env, { encoding: 'utf8' });
    console.log('Files written: .env.development, .env.production, .env');
  } catch (err) {
    console.error('Error writing files:', err);
    process.exit(1);
  }
}

main();

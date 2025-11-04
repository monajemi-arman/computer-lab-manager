#!/usr/bin/env node
/**
 * create-env.js
 *
 * Usage: node create-env.js
 *
 * creates .env.development, .env.production, and .env files based on the templates and user input.
 */

let fs;
let readline;
let forge;

const bcrypt = await import('bcryptjs');

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
  const forgeModule = await import('node-forge'); // Dynamically import node-forge
  forge = forgeModule.default || forgeModule; // Assign forge

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
  const defaultSshUser = 'computer-lab-manager'; // New default SSH user

  const MONGO_INITDB_ROOT_USERNAME = await prompt('MONGO root username', defaultRootUser);
  const MONGO_INITDB_ROOT_PASSWORD = await promptHidden('MONGO root password', defaultRootPass);
  const MONGO_APP_USERNAME = await prompt('MONGO normal user', defaultAppUser);
  const MONGO_APP_PASSWORD = await promptHidden('MONGO normal password', defaultAppPass);

  // Prompt for optional admin credentials (defaults empty)
  const ADMIN_USERNAME = await prompt('Admin username for dashboard login', '');
  const ADMIN_PASSWORD = await promptHidden('Admin password for dashboard login', '');

  const passwordToHash = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  };
  // Only hash if password is provided, otherwise set to empty string
  const ADMIN_PASSWORD_HASHED = ADMIN_PASSWORD ? await passwordToHash(ADMIN_PASSWORD) : '';

  // Build optional admin env entries only if provided
  let adminEntries = '';
  if (ADMIN_USERNAME) adminEntries += `ADMIN_USERNAME=${ADMIN_USERNAME}\n`;
  if (ADMIN_PASSWORD) adminEntries += `ADMIN_PASSWORD=${ADMIN_PASSWORD_HASHED}\n`;

  // Hosts and DB not asked for by default, but we keep the original hosts per file:
  const MONGO_HOST_DEV = defaultDevHost;
  const MONGO_HOST_PROD = defaultProdHost;
  const MONGO_DB = defaultDB;

  let sshKeyEntry = ''; // Initialize sshKeyEntry

  // Prompt for SSH_USER
  const SSH_USER = await prompt('SSH username for remote connections', defaultSshUser);

  try {
    console.log('Generating SSH private key using JavaScript...');
    // Generate an RSA key pair with 4096 bits
    const keypair = await forge.pki.rsa.generateKeyPair({ bits: 4096, e: 0x10001 });
    // Convert the private key to PEM format
    const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
    console.log('SSH private key generated successfully.');

    // Convert the public key to OpenSSH format
    const publicKeyOpenSSH = forge.ssh.publicKeyToOpenSSH(keypair.publicKey, 'generated-key');
    console.log('SSH public key generated successfully in OpenSSH format.');

    // Wrap the multi-line key in double quotes for .env files
    sshKeyEntry = `\n# SSH Private Key (auto-generated)\nSSH_PRIVATE_KEY="${privateKeyPem}"\n# SSH Public Key (auto-generated)\nSSH_PUBLIC_KEY="${publicKeyOpenSSH}"\n`;

    // Compose file contents
    const envDevelopment = `# Modify username and password for security
MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
MONGO_APP_USERNAME=${MONGO_APP_USERNAME}
MONGO_APP_PASSWORD=${MONGO_APP_PASSWORD}
${adminEntries}MONGO_HOST=${MONGO_HOST_DEV}  # Development
MONGO_DB=${MONGO_DB}
MONGODB_URI=mongodb://${MONGO_APP_USERNAME}:${MONGO_APP_PASSWORD}@${MONGO_HOST_DEV}:27017/${MONGO_DB}
DEV_JWT_PRIVATE_KEY=${defaultDevJwtKey}

# Next.JS parameters
NEXT_PUBLIC_API_BASE=${defaultNextPublic}
SSH_USER=${SSH_USER}
${sshKeyEntry}`; // Append SSH key entry

    const envProduction = `# Modify username and password for security
MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
MONGO_APP_USERNAME=${MONGO_APP_USERNAME}
MONGO_APP_PASSWORD=${MONGO_APP_PASSWORD}
${adminEntries}MONGO_HOST=${MONGO_HOST_PROD}  # Production
MONGO_DB=${MONGO_DB}
MONGODB_URI=mongodb://${MONGO_APP_USERNAME}:${MONGO_APP_PASSWORD}@${MONGO_HOST_PROD}:27017/${MONGO_DB}

# Next.JS parameters
NEXT_PUBLIC_API_BASE=${defaultNextPublic}
SSH_USER=${SSH_USER}
${sshKeyEntry}`; // Append SSH key entry

    const env = `# Modify username and password for security
MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
MONGO_APP_USERNAME=${MONGO_APP_USERNAME}
MONGO_APP_PASSWORD=${MONGO_APP_PASSWORD}
${adminEntries}MONGO_DB=${MONGO_DB}

# Next.JS parameters
NEXT_PUBLIC_API_BASE=${defaultNextPublic}
SSH_USER=${SSH_USER}
${sshKeyEntry}`; // Append SSH key entry

    fs.writeFileSync('.env.development', envDevelopment, { encoding: 'utf8' });
    fs.writeFileSync('.env.production', envProduction, { encoding: 'utf8' });
    fs.writeFileSync('.env', env, { encoding: 'utf8' });
    console.log('Files written: .env.development, .env.production, .env');
  } catch (err) {
    console.error('Error during environment setup:', err);
    process.exit(1);
  }
}

main();

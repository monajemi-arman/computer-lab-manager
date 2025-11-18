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
let path; // Declare path variable
let fileURLToPath; // Declare fileURLToPath variable
let dirname; // Declare dirname variable

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
  const pathModule = await import('path'); // Dynamically import path
  path = pathModule.default || pathModule; // Assign path
  const urlModule = await import('url'); // Dynamically import url
  fileURLToPath = urlModule.fileURLToPath; // Assign fileURLToPath
  dirname = path.dirname; // Assign dirname

  // Define __dirname equivalent for ES modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

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
  const defaultMinioRootUser = forge.util.bytesToHex(forge.random.getBytesSync(8)); // Auto-generate 16-char hex username
  const defaultMinioRootPass = forge.util.bytesToHex(forge.random.getBytesSync(16)); // Auto-generate 32-char hex password

  const MONGO_INITDB_ROOT_USERNAME = await prompt('MONGO root username', defaultRootUser);
  const MONGO_INITDB_ROOT_PASSWORD = await promptHidden('MONGO root password', defaultRootPass);
  const MONGO_APP_USERNAME = await prompt('MONGO normal user', defaultAppUser);
  const MONGO_APP_PASSWORD = await promptHidden('MONGO normal password', defaultAppPass);

  // Prompt for optional admin credentials (defaults empty)
  const ADMIN_USERNAME = await prompt('Admin username for dashboard login', 'admin');
  const ADMIN_PASSWORD = await promptHidden('Admin password for dashboard login', 'admin');

  const MINIO_ROOT_USER = defaultMinioRootUser;
  const MINIO_ROOT_PASSWORD = defaultMinioRootPass;

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

  let sshKeyEntry = ''; // This variable will no longer be used for key content

  // Prompt for SSH_USER
  const SSH_USER = await prompt('SSH username for remote connections', defaultSshUser);

  // Generate a random key for ANSIBLE_API_SHARED_KEY
  const ANSIBLE_API_SHARED_KEY = forge.util.bytesToHex(forge.random.getBytesSync(32)); // 32 bytes = 256 bits

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

    // Define the path for the .ssh directory
    const sshDirPath = path.join(__dirname, 'services', 'ansible-api', '.ssh');
    console.log(`Ensuring directory exists: ${sshDirPath}`);
    fs.mkdirSync(sshDirPath, { recursive: true });
    console.log('Directory created/ensured.');

    // Write private key to id_rsa with appropriate permissions
    const privateKeyPath = path.join(sshDirPath, 'id_rsa');
    fs.writeFileSync(privateKeyPath, privateKeyPem, { encoding: 'utf8', mode: 0o600 });
    console.log(`SSH private key written to: ${privateKeyPath}`);

    // Write public key to id_rsa.pub with appropriate permissions
    const publicKeyPath = path.join(sshDirPath, 'id_rsa.pub');
    fs.writeFileSync(publicKeyPath, publicKeyOpenSSH, { encoding: 'utf8', mode: 0o644 });
    console.log(`SSH public key written to: ${publicKeyPath}`);

    // Define the path for the ansible-api .env file
    const ansibleApiEnvPath = path.join(__dirname, 'services', 'ansible-api', '.env');
    // Write ANSIBLE_API_SHARED_KEY to the ansible-api .env file
    fs.writeFileSync(ansibleApiEnvPath, `ANSIBLE_API_SHARED_KEY=${ANSIBLE_API_SHARED_KEY}\n`, { encoding: 'utf8' });
    console.log(`ANSIBLE_API_SHARED_KEY written to: ${ansibleApiEnvPath}`);

    // Prepare key values for env files: private key PEM with \n escapes, public key in OpenSSH single-line
    const SSH_PRIVATE_KEY = privateKeyPem.replace(/\r?\n/g, '\\n');
    const SSH_PUBLIC_KEY = publicKeyOpenSSH.trim();

    // Compose file contents
    const envDevelopment = `# Modify username and password for security
MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
MONGO_APP_USERNAME=${MONGO_APP_USERNAME}
MONGO_APP_PASSWORD=${MONGO_APP_PASSWORD}
${adminEntries}
# MinIO Credentials
MINIO_ROOT_USER=${MINIO_ROOT_USER}
MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}

MONGO_HOST=${MONGO_HOST_DEV}  # Development
MONGO_DB=${MONGO_DB}
MONGODB_URI=mongodb://${MONGO_APP_USERNAME}:${MONGO_APP_PASSWORD}@${MONGO_HOST_DEV}:27017/${MONGO_DB}
DEV_JWT_PRIVATE_KEY=${defaultDevJwtKey}
ANSIBLE_API="http://localhost:8000"
ANSIBLE_API_SHARED_KEY=${ANSIBLE_API_SHARED_KEY}

# Next.JS parameters
NEXT_PUBLIC_API_BASE=${defaultNextPublic}
SSH_PRIVATE_KEY="${SSH_PRIVATE_KEY}"
SSH_PUBLIC_KEY="${SSH_PUBLIC_KEY}"
SSH_USER=${SSH_USER}`; // Removed ${sshKeyEntry} as keys are now in files

    const envProduction = `# Modify username and password for security
MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
MONGO_APP_USERNAME=${MONGO_APP_USERNAME}
MONGO_APP_PASSWORD=${MONGO_APP_PASSWORD}
${adminEntries}
# MinIO Credentials
MINIO_ROOT_USER=${MINIO_ROOT_USER}
MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}

MONGO_HOST=${MONGO_HOST_PROD}  # Production
MONGO_DB=${MONGO_DB}
MONGODB_URI=mongodb://${MONGO_APP_USERNAME}:${MONGO_APP_PASSWORD}@${MONGO_HOST_PROD}:27017/${MONGO_DB}
ANSIBLE_API="http://ansible:8000"
ANSIBLE_API_SHARED_KEY=${ANSIBLE_API_SHARED_KEY}

# Next.JS parameters
NEXT_PUBLIC_API_BASE=${defaultNextPublic}
SSH_PRIVATE_KEY="${SSH_PRIVATE_KEY}"
SSH_PUBLIC_KEY="${SSH_PUBLIC_KEY}"
SSH_USER=${SSH_USER}`; // Removed ${sshKeyEntry} as keys are now in files

    const env = `# Modify username and password for security
MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
MONGO_APP_USERNAME=${MONGO_APP_USERNAME}
MONGO_APP_PASSWORD=${MONGO_APP_PASSWORD}
${adminEntries}
# MinIO Credentials
MINIO_ROOT_USER=${MINIO_ROOT_USER}
MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}

MONGO_DB=${MONGO_DB}
ANSIBLE_API_SHARED_KEY=${ANSIBLE_API_SHARED_KEY}

# Next.JS parameters
NEXT_PUBLIC_API_BASE=${defaultNextPublic}
SSH_PRIVATE_KEY="${SSH_PRIVATE_KEY}"
SSH_PUBLIC_KEY="${SSH_PUBLIC_KEY}"
SSH_USER=${SSH_USER}`; // Removed ${sshKeyEntry} as keys are now in files

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

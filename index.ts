import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const algorithm = 'aes-256-ctr';

function encrypt(filePath: string, password: string) {
    const key = crypto.scryptSync(password, 'salt', 32); // Derive a key using the password
    const iv = crypto.randomBytes(16); // Generate a random initialization vector
    const options = {}; // Additional options if needed
  
    const cipher = crypto.createCipheriv(algorithm, key, iv, options);
    const input = fs.createReadStream(filePath);
    const output = fs.createWriteStream(`${filePath}_encrypted`);
    logActivity(`Mulai mengenkripsi file ${filePath}`);
  
    input.pipe(cipher).pipe(output);
  
    output.on('finish', () => {
      logActivity(`Berhasil mengenkripsi file ${filePath}`);
      console.log(`File '${filePath}' berhasil dienkripsi menjadi '${filePath}_encrypted'`);
    });
  
    input.on('error', (err) => {
      logActivity(`Error ketika mengenkripsi file: '${err.message}'`);
      console.error(`Error: ${err.message}`);
    });
  }

  function decrypt(filePath: string, password: string) {
    const key = crypto.scryptSync(password, 'salt', 32); // Derive a key using the password
    const iv = Buffer.alloc(16, 0); // Initialization vector, should match what was used during encryption
    const options = {}; // Additional options if needed
  
    const decipher = crypto.createDecipheriv(algorithm, key, iv, options);
    const input = fs.createReadStream(filePath);
    const output = fs.createWriteStream(filePath.replace('_encrypted', ''));
    logActivity(`Mulai mendekripsi file ${filePath}`);
  
    input.pipe(decipher).pipe(output);
  
    output.on('finish', () => {
      logActivity(`Berhasil mendekripsi file ${filePath}`);
      console.log(`File '${filePath}' berhasil didekripsi menjadi '${filePath.replace('_encrypted', '')}'`);
    });
  
    input.on('error', (err) => {
      logActivity(`Error ketika mendekripsi file: '${err.message}'`);
      console.error(`Error: ${err.message}`);
    });
  }

function logActivity(message: string) {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const logFileName = `${timestamp.split(' ').join('_').replace(/:/g, '')}.log`;
  fs.appendFile(logFileName, `${timestamp} - ${message}\n`, (err) => {
    if (err) console.error(`Error logging activity: ${err.message}`);
  });
}

const [action, filePath, password] = process.argv.slice(2);

if (action === 'encrypt') {
  encrypt(filePath, password);
} else if (action === 'decrypt') {
  decrypt(filePath, password);
} else {
  console.log('Action tidak dikenali. Gunakan "encrypt" atau "decrypt".');
}

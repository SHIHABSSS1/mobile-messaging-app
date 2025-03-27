const fs = require('fs');
const readline = require('readline');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Message App Firebase Setup Helper\n');
console.log('This script will help you set up your Firebase configuration.\n');
console.log('Please have your Firebase project configuration ready.');
console.log('You can find this in your Firebase Project Settings > General > Your apps > SDK setup and configuration.\n');

const configFile = 'src/firebase/config.ts';

// Helper to prompt for Firebase config values
const promptConfig = () => {
  return new Promise((resolve) => {
    const config = {};
    
    rl.question('Enter your apiKey: ', (apiKey) => {
      config.apiKey = apiKey;
      
      rl.question('Enter your authDomain: ', (authDomain) => {
        config.authDomain = authDomain;
        
        rl.question('Enter your projectId: ', (projectId) => {
          config.projectId = projectId;
          
          rl.question('Enter your storageBucket: ', (storageBucket) => {
            config.storageBucket = storageBucket;
            
            rl.question('Enter your messagingSenderId: ', (messagingSenderId) => {
              config.messagingSenderId = messagingSenderId;
              
              rl.question('Enter your appId: ', (appId) => {
                config.appId = appId;
                resolve(config);
              });
            });
          });
        });
      });
    });
  });
};

// Update the Firebase config file
const updateFirebaseConfig = async () => {
  try {
    if (!fs.existsSync(configFile)) {
      console.error(`Firebase config file not found at ${configFile}`);
      return false;
    }
    
    const config = await promptConfig();
    
    let content = fs.readFileSync(configFile, 'utf8');
    
    content = content.replace(/"YOUR_API_KEY"/g, `"${config.apiKey}"`);
    content = content.replace(/"YOUR_AUTH_DOMAIN"/g, `"${config.authDomain}"`);
    content = content.replace(/"YOUR_PROJECT_ID"/g, `"${config.projectId}"`);
    content = content.replace(/"YOUR_STORAGE_BUCKET"/g, `"${config.storageBucket}"`);
    content = content.replace(/"YOUR_MESSAGING_SENDER_ID"/g, `"${config.messagingSenderId}"`);
    content = content.replace(/"YOUR_APP_ID"/g, `"${config.appId}"`);
    
    fs.writeFileSync(configFile, content, 'utf8');
    
    console.log('\nFirebase configuration updated successfully!');
    return true;
  } catch (error) {
    console.error('Error updating Firebase configuration:', error);
    return false;
  }
};

// Install Firebase CLI if not installed
const checkFirebaseCLI = () => {
  return new Promise((resolve) => {
    exec('firebase --version', (error) => {
      if (error) {
        console.log('\nFirebase CLI is not installed. Would you like to install it? (y/n)');
        rl.question('> ', (answer) => {
          if (answer.toLowerCase() === 'y') {
            console.log('\nInstalling Firebase CLI...');
            exec('npm install -g firebase-tools', (err, stdout, stderr) => {
              if (err) {
                console.error('Error installing Firebase CLI:', stderr);
                resolve(false);
              } else {
                console.log('Firebase CLI installed successfully!');
                resolve(true);
              }
            });
          } else {
            console.log('\nSkipping Firebase CLI installation.');
            resolve(false);
          }
        });
      } else {
        console.log('\nFirebase CLI is already installed.');
        resolve(true);
      }
    });
  });
};

// Main function
const main = async () => {
  const configUpdated = await updateFirebaseConfig();
  
  if (configUpdated) {
    console.log('\nWould you like to install project dependencies? (y/n)');
    rl.question('> ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        console.log('\nInstalling dependencies...');
        exec('npm install', (err, stdout, stderr) => {
          if (err) {
            console.error('Error installing dependencies:', stderr);
          } else {
            console.log('Dependencies installed successfully!');
            
            checkFirebaseCLI().then((hasFirebaseCLI) => {
              if (hasFirebaseCLI) {
                console.log('\nWould you like to log in to Firebase? (y/n)');
                rl.question('> ', (answer) => {
                  if (answer.toLowerCase() === 'y') {
                    console.log('\nLogging in to Firebase...');
                    exec('firebase login', (err, stdout, stderr) => {
                      if (err) {
                        console.error('Error logging in to Firebase:', stderr);
                      } else {
                        console.log('Logged in to Firebase successfully!');
                      }
                      finishSetup();
                    });
                  } else {
                    finishSetup();
                  }
                });
              } else {
                finishSetup();
              }
            });
          }
        });
      } else {
        finishSetup();
      }
    });
  } else {
    finishSetup();
  }
};

const finishSetup = () => {
  console.log('\nSetup completed! You can now start the app with "npm start".');
  console.log('Remember to enable Email/Password authentication, Firestore, and Storage in your Firebase project.');
  rl.close();
};

main(); 
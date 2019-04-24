#!/usr/bin/env node

const program = require('commander');
const gaze = require('gaze');
const path = require('path');
const startServer = require('../server');
const { version } = require('../package.json');

program.version(version);

program
  .command('start <contracts>')
  .option('-t, --types <folder>')
  .option('-m, --mocks <folder>')
  .action((contractsDir, cmd) => {
    const mocksDir = cmd.mocks;
    const typesDir = cmd.types;
    gaze(
      [
        `${path.resolve(contractsDir)}/**/*.graphql`,
        ...(mocksDir ? [`${path.resolve(mocksDir)}/**/*.js`] : []),
        ...(typesDir ? [`${path.resolve(typesDir)}/**/*.graphql`] : []),
      ],
      (err, watcher) => {
        if (err) throw new Error(err);

        let server = startServer(contractsDir, mocksDir, typesDir);

        watcher.on('all', () => {
          console.log('Change detected...'); // eslint-disable-line
          server.close();
          server = startServer(contractsDir, mocksDir, typesDir);
        });
      },
    );
  });

program.parse(process.argv);

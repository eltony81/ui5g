const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const path = require('path');
const process = require('process');
const mkdirp = require('mkdirp');

module.exports = class extends Generator {
  prompting() {
    /* Have Yeoman greet the user.*/
    this.log(yosay(
      'Welcome to the ' + chalk.green('ADF') + " -- " + chalk.red('generator-ui5gtny') + ' generator!'
    ));

    const prompts = [{
      type: 'input',
      name: 'name',
      message: 'App name',
      "default": 'ui5AppDemo'
    }, {
      type: 'input',
      name: 'namespace',
      message: 'App namespace',
      "default": 'ui5.app.demo'
    },
    {
      type: 'input',
      name: 'description',
      message: 'App description',
      "default": 'Simple App Demo Skeleton'
    },
    {
      type: 'list',
      name: 'ui5Domain',
      message: 'SAPUI5 or OpenUI5?',
      choices: [{
        name: 'OpenUI5',
        value: 'openui5.hana.ondemand.com'
      }, {
        name: 'SAPUI5',
        value: 'sapui5.hana.ondemand.com'
      }]
    }];
    return this.prompt(prompts).then(props => {
      props.dir = props.name.replace(/[^a-zA-Z]/g, '');
      props.namepath = props.namespace.replace(/\./g, '/');
      this.props = props;
    });
  }

  writing() {
    this.props.timestamp = (new Date()).getTime();
    const targetPathRoot = path.join(process.cwd(), this.props.dir);
    this.destinationRoot(targetPathRoot);
    mkdirp(targetPathRoot, () => {
      this.fs.copyTpl(this.templatePath(), this.destinationPath(), this.props);
      this.fs.copyTpl(this.templatePath('.*/**'), this.destinationPath(), this.props);
      this.fs.copyTpl(this.templatePath('.vscode/**'), this.destinationPath('.vscode'), this.props);
    });
  }

  installing() {
    this.npmInstall();
  }
};

const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const path = require('path');
const process = require('process');
const mkdirp = require('mkdirp');
const download = require('download');
const fs = require('fs');
const extract = require('extract-zip')

	module.exports = class extends Generator {
	prompting() {
		/* Have Yeoman greet the user.*/
		this.log(yosay(
				'Welcome to the ' + chalk.green('ADF') + " -- " + chalk.red('generator-ui5gtny') + ' generator!'));

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
			}, {
				type: 'input',
				name: 'description',
				message: 'App description',
				"default": 'Simple App Demo Skeleton'
			}, {
				type: 'input',
				name: 'libver',
				message: 'OpenUI5 version?',
				"default": '1.61.2'
			}
		];
		return this.prompt(prompts).then(props => {
			props.dir = props.name.replace(/[^a-zA-Z]/g, '');
			props.namepath = props.namespace.replace(/\./g, '/');
			this.props = props;
		});
	}

	writing() {
		this.props.timestamp = (new Date()).getTime();
		let libURL = "https://openui5.hana.ondemand.com/downloads/openui5-runtime-" + this.props.libver + ".zip";
		const targetPathRoot = path.join(process.cwd(), this.props.dir);

		download(libURL).then(data => {
			if(!data) {
				console.error("Cannot download " + libURL);
				return;
			}
			console.log("Successfully downloaded " + libURL);
			if (!fs.existsSync("ui5lib")) {
				fs.mkdirSync("ui5lib");
			}
			fs.writeFileSync("ui5lib/ui5lib.zip", data);
			extract("ui5lib/ui5lib.zip", {
				dir: process.cwd() + "/ui5lib"
			}, function (err) {
				if (err) {
					console.error(err);
				} else {
					try {
						fs.unlinkSync("ui5lib/ui5lib.zip");
						console.log("Successfully deleted ui5lib/ui5lib.zip");
					} catch (err) {
						console.error(err);
					}
				}
			});
		});

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

/*!
 * Engagement Lab Site Framework
 * Developed by Engagement Lab, 2016
 * ==============
*/

 /**
 * Initialize an instance of KeystoneJS and mounts it to the pre-defined ExpressJS app.
 *
 * ### Examples:
 *
 *    siteFactory( { name: siteName, config: configData, app: appInstance, keystone: siteInst.keystone } );
 *
 * @class Sites
 * @name sites/factory
 * @param {Object} params The needed site config and Keystone, Express app, and Mongoose instance refs.
 * @param {Function} callback 
 * @return {Object} keystone.app Keystone's Express app reference
 * @see http://www.keystonejs.com/docs/configuration/
 */
 var SiteFactory = (function(params, callback) { 

 	// Load handlebars and our helpers
	var handlebars = require('express-handlebars'),
			hbsHelpers = require('../templates/helpers')();

	// Global dependencies
	var tamabehavior = require('../tamabehavior'),
	Slack = require('slack-node'),
	Twitter = require('twitter'),
	KeystoneSlacker = require('keystone-slacker'),
	FrameworkMiddleware = require('./middleware');

	var siteConfig = params.config, 
			siteRoot =  require.resolve(params.moduleName).replace('app.js', ''),
			appInst = params.app,
			keystoneInst = params.keystone;

	var slackInstance;
	var twitterInstance;

	console.log('Initializing '.underline + 
							colors.cyan.underline(siteConfig.name) + 
							' site module.'.underline);

	// Init the keystone instance when it is opened
		
	keystoneInst.init({

		'brand': 'Engagement Lab',
		'module root': siteRoot,
		'mongo': 'mongodb://localhost/' + siteConfig.database,

		'frame guard': false,
		'auto update': true,
		'session': true,
		'auth': true,
		'user model': 'User',

		// Setup SASS and Handlebars
		'sass': [siteRoot + '../../public', siteRoot + 'public'],
		'static': [siteRoot + '../../public', siteRoot + 'public'],
		'views': siteRoot + 'templates/views',
		'view engine': 'hbs',
		'custom engine':
			handlebars.create({
				layoutsDir: siteRoot + 'templates/layouts',
				partialsDir: [ { dir: siteRoot + '../../public', namespace: 'core' }, '../templates/partials', siteRoot + 'templates/partials'],
				defaultLayout: 'base',
				helpers: hbsHelpers,
				extname: '.hbs'
			}).engine,

		'locals': {

			_: require('underscore'),
			env: keystoneInst.get('env'),
			utils: keystoneInst.utils,
			editable: keystoneInst.content.editable

		},

		// prefix all built-in tags with 'keystone_'
		'cloudinary prefix': 'keystone',

		// prefix each image public_id with [{prefix}]/{list.path}/{field.path}/
		'cloudinary folders': true

	});

	// Used only for production, otherwise sessions are stored in-memory
	if (process.env.NODE_ENV === 'production') {

		keystoneInst.set('session store', 'connect-mongostore');
		keystoneInst.set('session store options', {
			"db": {
				"name": siteConfig.database,
				"servers": [
					{ "host": "127.0.0.1", "port": 27017 }
				]
			}
		});

	}

	// Slack API instantiation
	slackInstance = new Slack(process.env.SLACK_API_KEY);
	slackInstance.setWebhook(process.env.SLACK_HOOK_URI);
	slackInstance.channel = '#website_updates';
	slackInstance.user = 'ELBot';
	slackInstance.user_icon = 'http://res.cloudinary.com/engagement-lab-home/image/upload/v1454193996/site/logo_bot.png';

	// Twitter API instantiation
	twitterInstance = new Twitter({
		consumer_key: process.env.TWITTER_CONSUMER_KEY,
		consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
		access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
		access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
	});

	// slack needs to be be accessible anywhere (using our keystone-slacker package)
	var keystoneSlacker = new KeystoneSlacker(slackInstance, keystoneInst);
	keystoneInst.set('slack', keystoneSlacker);

	keystoneInst.set('twitter', twitterInstance);
	keystoneInst.set('tamabehavior', tamabehavior);

	// Load this site's models
	keystoneInst.import('models');

	// Load this site's routes
	keystoneInst.set('routes', require(siteRoot + 'routes'));
	 
	// Configure Admin UI
	keystoneInst.set('nav', siteConfig.admin_nav);

	var middleware = new FrameworkMiddleware();
	if(siteConfig.allowed_domains !== undefined)
		keystoneInst.pre('routes', middleware.urlWhitelist(siteConfig.allowed_domains));

	// Mount to '/' (root of virtual host's subdomain)
	keystoneInst.mount('/', appInst, {
    onMount: function() {
		  callback(keystoneInst.app);
    }
	});
		
});

module.exports = SiteFactory;
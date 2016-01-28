/**
 * Engagement Lab Website
 * 
 * Resource page Model
 * @module resource
 * @author Johnny Richardson
 * 
 * For field docs: http://keystonejs.com/docs/database/
 *
 * ==========
 */

var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * @module resource
 * @constructor
 * See: http://keystonejs.com/docs/database/#lists-options
 */
var Resource = new keystone.List('Resource', {
	autokey: { from: 'name', path: 'key', unique: true },
  track: true
});

/**
 * Model Fields
 * @main Resource
 */
Resource.add({
	name: { type: String, label: 'Resource Name', required: true, initial: true, index: true },
	type: { type: Types.Select, label: 'Type', options: 'video, article, file', default: 'video', required: true, initial: true },

	url: { type: String, label: 'URL',
		dependsOn: { type: ['video', 'article'] }, initial: true },

	// This field is required in the save hook below instead of here as keystone dependsOn workaround
	summary: { type: String, label: 'Summary',
		dependsOn: { type: 'article' } },
	date: { type: Date, label: "Date Published",
		dependsOn: { type: 'article' } },
	author: { type: String, label: 'Author',
		dependsOn: { type: 'article' } },

	file: {
		type: Types.AzureFile,
		dependsOn: { type: 'file' },
		label: 'File',
		filenameFormatter: function(item, filename) {
			return item._id + require('path').extname(filename);
		},
		containerFormatter: function(item, filename) {
			return 'resources';
		}
	},



	imageOverride: {
      type: Types.CloudinaryImage,
      dependsOn: { type : 'article' },
      label: 'Image Override',
      folder: 'site/research',
      note: 'This should be used if the image provided automatically is not acceptable.',
      autoCleanup: true
  },

	data: { type: Types.Embedly, from: 'url', hidden: true },
	createdAt: { type: Date, default: Date.now, noedit: true, hidden: true }
});

/**
 * Hooks
 * =============
 */
Resource.schema.pre('save', function(next) {
  
  var err;
  
  if (this.type === 'article') {
    
    if (this.date !== undefined && this.date.length === 0)
		err = 'You must provide the date that the article was published. Sorry bub.';

		//  if (this.summary !== undefined && this.summary.length === 0)
		// err = ('You must define a summary for articles.');

		// else if (this.author !== undefined && this.author.length === 0) 
		// 	err = 'You must provide the name of the author who published the article.';
  
  }

	if(err !== undefined && err.length > 0)
		next(new Error(err));
	else
		next();

});
Resource.schema.pre('remove', function(next) {

  // Remove resource from all that referenced it 
	keystone.list('Project').model.removeResourceRef(this._id, function(err, removedCount) {

		if(err)
			console.error(err);
    
		if(removedCount > 0) {
			console.log("Removed " +  removedCount + " references to '"+ this._id + "'");
			next();
		}

	});

});


/**
 * Relationships
 * =============
 */
Resource.relationship({ ref: 'Project', refPath: 'projects', path: 'resources' });

/**
 * Model Registration
 */
Resource.defaultSort = '-createdAt';
Resource.defaultColumns = 'name, type, createdAt';
Resource.register();

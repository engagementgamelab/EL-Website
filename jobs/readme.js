/*!
 * Engagement Lab Site Framework
 * Developed by Engagement Lab, 2016
 * ==============
*/

 /**
 * Repository readme creation job. Outputs any code comments compatible with markdox as markdown file.
 *
 * @class Jobs
 * @name jobs/readme
 * @see https://github.com/cbou/markdox
 */
'use strict';
var markdox = require('markdox');

var files = ['server.js', 'sites/config.js', 'sites/factory.js', 'jobs/news.js', 'jobs/readme.js', 'Gruntfile.js'];

markdox.process(files, 'docs/CODE.md', function(){
  console.log('File `docs/CODE.md` generated with success');
});
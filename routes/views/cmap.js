/**
 * Engagement Lab Website
 * Developed by Engagement Lab, 2015
 * ==============
 * CMAP page view controller.
 *
 * Help: http://keystonejs.com/docs/getting-started/#routesviews-firstview
 *
 * @class cmap
 * @static
 * @author Johnny Richardson
 *
 * ==========
 */
var keystone = require('keystone');
var Academics = keystone.list('Academics');
var Person = keystone.list('Person');
var Project = keystone.list('Project');
var Cmap = keystone.list('Cmap');
var _ = require('underscore');

exports = module.exports = function(req, res) {

    var view = new keystone.View(req, res),
        locals = res.locals;

    // Init locals
    locals.section = 'programs';

    // Load the current project
    view.on('init', function(next) {

        var q = Cmap.model.findOne({}, {}, {
            sort: { 'createdAt': -1 }
        });

        q.exec(function(err, result) {

            // Get page elements
            locals.cmap = result;
            locals.elements = [];
            for (var i = 0; i < result.headers.length; i++) {
                locals.elements.push({
                    header: result.headers[i],
                    subheader: result.subheaders[i],
                    element: result.elements[i]
                });
            }

            // Get faculty
            Person.model.find({ 'cmapPerson': true }).sort([
                ['sortOrder', 'ascending']
            ]).exec(function(err, result){

                if (err) throw err;
                locals.people = result;

                // Get projects
                Project.model.find({
                    'enabled': true,
                    'cmapProject': true
                }).sort([
                    ['sortOrder', 'ascending']
                ]).exec(function(err, resultProject) {
                    _.map(resultProject, function(proj) {

                        // Get image code
                        proj.href = '/' + req.params.directory + 
                        '/' + req.params.subdirectory + 
                        '/' + proj.key;
                        proj.description = proj.description;

                        return proj;

                    });

                    locals.projects = resultProject;
                    next(err);

                });
            });
        });
    });

    // Render the view
    view.render('cmap');

};
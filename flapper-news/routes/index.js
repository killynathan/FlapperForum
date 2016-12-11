var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// GET all posts
router.get('/posts', function(req, res, next) {
	Post.find(function(err, posts) {
		if (err) return next(err);
		res.json(posts);
	});
});

// POST new news-post
router.post('/posts', function(req, res, next) {
	var post = new Post(req.body);

	post.save(function(err, post) {
		if (err) return next(err);

		res.json(post);
	});
});

// GET single post
router.get('/posts/:id', function(req, res, next) {
	Post.findById(req.params.id, function(err, post) {
		if (err) return next(err);

		post.populate('comments', function(err, post) {
			if (err) return next(err);

			res.json(post);
		});
	});
});

// PUT upvote post
router.put('/posts/:id/upvote', function(req, res, next) {
	Post.findById(req.params.id, function(err, post) {
		if (err) return next(err);
		
		post.upvote(function(err, post) {
			if (err) return next(err);
			res.json(post);
		});
	});
});

// PUT upvote comment
router.put('/posts/:id/comments/:id2', function(req, res, next) {
	Comment.findById(req.params.id2, function(err, comment) {
		if (err) return next(err);

		comment.upvote(function(err, comment) {
			if (err) return next(err);
			res.json(comment);
		});
	});
});

// POST new comment
router.post('/posts/:id/comments', function(req, res, next) {
	Post.findById(req.params.id, function(err, post) {
		if (err) return next(err);

		var comment = new Comment(req.body);
		comment.post = post;
		comment.save(function(err, comment) {
			if (err) return next(err);
			post.comments.push(comment);
			post.save(function(err, post) {
				if (err) return next(err);
				res.json(comment);
			})
		});
	});
});


module.exports = router;

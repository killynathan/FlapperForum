var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

var passport = require('passport');
var jwt = require('express-jwt');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

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
router.post('/posts', auth, function(req, res, next) {
	var post = new Post(req.body);
	post.author = req.payload.username;
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
router.put('/posts/:id/upvote', auth, function(req, res, next) {
	Post.findById(req.params.id, function(err, post) {
		if (err) return next(err);
		
		post.upvote(function(err, post) {
			if (err) return next(err);
			res.json(post); 
		});
	});
});

// PUT upvote comment
router.put('/posts/:id/comments/:id2', auth, function(req, res, next) {
	Comment.findById(req.params.id2, function(err, comment) {
		if (err) return next(err);

		comment.upvote(function(err, comment) {
			if (err) return next(err);
			res.json(comment);
		});
	});
});

// POST new comment
router.post('/posts/:id/comments', auth, function(req, res, next) {
	Post.findById(req.params.id, function(err, post) {
		if (err) return next(err);

		var comment = new Comment(req.body);
		comment.post = post;
		comment.author = req.payload.username;
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

// POST new user
router.post('/register', function(req, res, next) {
	if (!req.body.username || !req.body.password) 
		return res.status(400).json({message: 'Please fill out all fields'});

	var user = new User();

	user.username = req.body.username;
	user.setPassword(req.body.password);

	user.save(function(err) {
		if (err) return next(err);

		return res.json({token: user.generateJWT()});
	});
});

// PUT login
router.put('/login', function(req, res, next) {
	if (!req.body.username || !req.body.password) 
		return res.status(400).json({message: 'Please fill out fields'});

	passport.authenticate('local', function(err, user, info) {
		if (err) return next(err);

		if (user) {
			return res.json({token: user.generateJWT()});
		}

		else {
			return res.status(401).json(info);
		}
	})(req, res, next);
});


module.exports = router;

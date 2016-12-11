var app = angular.module('flapperNews', ['ui.router']);

app.factory('posts', ['$http', function($http) {
	var o = {
		posts: []
	};

	o.getAll = function() {
		return $http.get('/posts').success(function(data) {
			angular.copy(data, o.posts);
		});
	};

	o.create = function(post) {
		return $http.post('/posts', post).success(function(data) {
			o.posts.push(data);
		});
	};

	o.upvote = function(post) {
		return $http.put('/posts/' + post._id + '/upvote').success(function(data) {
			post.upvotes++;
		});
	};

	o.get = function(id) {
		return $http.get('/posts/' + id).then(function(res) {
			return res.data;
		});
	};

	o.addComment = function(id, comment) {
		return $http.post('/posts/' + id + '/comments', comment);
	};

	o.upvoteComment = function(post_id, comment) {
		return $http.put('/posts/' + post_id + '/comments/' + comment._id).success(function(data) {
			comment.upvotes++;
		});
	};

	return o;
}]);

app.controller('MainCtrl', ['$scope', 'posts', function($scope, posts) {
		$scope.test = 'Hello World';
		$scope.posts = posts.posts;
		$scope.title = '';
		$scope.link = '';
		$scope.addPost = function() {
			if ($scope.title !== '') {
				posts.create({	
					title: $scope.title, 
					link: $scope.link,
					upvotes: 0
				});
				$scope.title = '';
				$scope.link = '';
			}
		};	
		$scope.incrementUpvotes = function(post) {
			posts.upvote(post);
		};
}]);

app.controller('PostsCtrl', ['$scope', 'posts', 'post', function($scope, posts, post) {
	$scope.post = post;
	$scope.incrementUpvotes = function(comment) {
		posts.upvoteComment(post._id, comment);
	};
	$scope.body;
	$scope.addComment = function() {
		if ($scope.body && $scope.body !== '') {
			posts.addComment(post._id, {
				body: $scope.body,
    			author: 'user',
    			upvotes: 0
			}).success(function(comment) {
				$scope.post.comments.push(comment);
			});
			$scope.body = '';
		}
	};
}]);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	$stateProvider.state('home', {
		url: '/home',
		templateUrl: 'partials/home.ejs',
		controller: 'MainCtrl',
		resolve: {
			postPromise: ['posts', function(posts) {
				return posts.getAll();
			}]
		}
	})
	.state('posts', {
		url: '/posts/{id}',
		templateUrl: 'partials/posts.ejs',
		controller: 'PostsCtrl',
		resolve: {
			post: ['$stateParams', 'posts', function($stateParams, posts) {
				return posts.get($stateParams.id);
			}]
		}
	});	

	$urlRouterProvider.otherwise('home');
}]);


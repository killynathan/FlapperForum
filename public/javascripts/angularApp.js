var app = angular.module('flapperNews', ['ui.router']);

app.factory('posts', ['$http', 'auth', function($http, auth) {
	var o = {
		posts: []
	};

	o.getAll = function() {
		return $http.get('/posts').success(function(data) {
			angular.copy(data, o.posts);
		});
	};

	o.create = function(post) {
		return $http.post('/posts', post, {
    		headers: {Authorization: 'Bearer '+auth.getToken()}
  		}).success(function(data) {
			o.posts.push(data);
		});
	};

	o.upvote = function(post) {
		return $http.put('/posts/' + post._id + '/upvote', null, {headers: {Authorization: 'Bearer '+auth.getToken()}}).success(function(data) {
			post.upvotes++;
		});
	};

	o.get = function(id) {
		return $http.get('/posts/' + id).then(function(res) {
			return res.data;
		});
	};

	o.addComment = function(id, comment) {
		return $http.post('/posts/' + id + '/comments', comment, {headers: {Authorization: 'Bearer '+auth.getToken()}});
	};

	o.upvoteComment = function(post_id, comment) {
		return $http.put('/posts/' + post_id + '/comments/' + comment._id, null, {headers: {Authorization: 'Bearer ' +auth.getToken()}}).success(function(data) {
			comment.upvotes++;
		});
	};

	return o;
}]);

app.factory('auth', ['$http', '$window', function($http, $window) {
	var auth = {};

	auth.saveToken = function(token) {
		$window.localStorage['flapper-news-token'] = token;
	};

	auth.getToken = function() {
		return $window.localStorage['flapper-news-token'];
	};

	auth.isLoggedIn = function() {
		var token = auth.getToken();

		if (token) {
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.exp > Date.now() / 1000;
		}
		else {
			return false;
		}
	};

	auth.currentUser = function() {
		if (auth.isLoggedIn()) {
			var token = auth.getToken();
			var payload = JSON.payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.username;
		}
	};

	auth.register = function(user) {
		return $http.post('/register', user).success(function(data) {
			auth.saveToken(data.token);
		});
	};

	auth.logIn = function(user) {
		return $http.put	('/login', user).success(function(data) {
			auth.saveToken(data.token);
		});
	};

	auth.logOut = function() {
		$window.localStorage.removeItem('flapper-news-token');
	};

	return auth;
}]);

app.controller('MainCtrl', ['$scope', 'posts', '$state', 'auth', function($scope, posts, $state, auth) {
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.posts = posts.posts;
		$scope.title = '';
		$scope.link = '';
		$scope.body = '';
		$scope.addPost = function() {
			if ($scope.title !== '') {
				posts.create({	
					title: $scope.title, 
					link: $scope.link,
					body: $scope.body,
					upvotes: 0
				});
				$scope.title = '';
				$scope.link = '';
				$scope.body = '';
				$state.go('home');
			}
		};	
		$scope.incrementUpvotes = function(post) {
			posts.upvote(post);
		}; 
}]);

app.controller('PostsCtrl', ['$scope', 'posts', 'post', 'auth', function($scope, posts, post, auth) {
	$scope.isLoggedIn = auth.isLoggedIn;
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

app.controller('AuthCtrl', ['$scope', '$state', 'auth', function($scope, $state, auth) {
	$scope.user = {};

	$scope.register = function() {
		auth.register($scope.user).error(function(error) {
			$scope.error = error;
		}).then(function() {
			$state.go('home');
		});
	};

	$scope.logIn = function() {
		auth.logIn($scope.user).error(function(error) {
			$scope.error = error;
		}).then(function() {
			$state.go('home');
		});
	};
}]);

app.controller('NavCtrl', ['$scope', 'auth', function($scope, auth) {
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.currentUser = auth.currentUser;
	$scope.logOut = auth.logOut;
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
	})
	.state('login', {
		url: '/login',
		templateUrl: 'partials/login.ejs',
		controller: 'AuthCtrl',
		onEnter: ['$state', 'auth', function($state, auth) {
			if (auth.isLoggedIn()) {
				$state.go('home');
			}
		}]
	})
	.state('register', {
		url: '/register',
		templateUrl: 'partials/register.ejs',
		controller: 'AuthCtrl',
		onEnter: ['$state', 'auth', function($state, auth) {
			if (auth.isLoggedIn()) {
				$state.go('home');
			}
		}]
	}).state('/submit', {
		url: '/submit',
		templateUrl: 'partials/submit.ejs',
		controller: 'MainCtrl'
	});

	$urlRouterProvider.otherwise('home');
}]);


var app = angular.module('flapperNews', ['ui.router']);

app.factory('posts', [function() {
	var o = {
		posts: []
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
				$scope.posts.push({
					title: $scope.title, 
					link: $scope.link,
					upvotes: 0,
					comments: [
						{author: 'Nate', body: 'I am cool', upvotes: 10},
						{author: 'Joe', body: 'wtf', upvotes: 1},
						{author: 'Kevin', body: 'testing testing 123', upvotes: 20}
					]
				});
				$scope.title = '';
				$scope.link = '';
			}
		}
		$scope.incrementUpvotes = function(post) {
			post.upvotes++;
		}
}]);

app.controller('PostsCtrl', ['$scope', '$stateParams', 'posts', function($scope, $stateParams, posts) {
	$scope.post = posts.posts[$stateParams.id];
	$scope.incrementUpvotes = function(comment) {
		comment.upvotes++;
	};
	$scope.body;
	$scope.addComment = function() {
		if ($scope.body && $scope.body !== '') {
			$scope.post.comments.push({
				author: 'User',
				body: $scope.body,
				upvotes: 0
			});
			$scope.body = '';
		}
	};
}]);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	$stateProvider.state('home', {
		url: '/home',
		templateUrl: 'partials/home.html',
		controller: 'MainCtrl'
	})
	.state('posts', {
		url: '/posts/{id}',
		templateUrl: 'partials/posts.html',
		controller: 'PostsCtrl'
	});

	$urlRouterProvider.otherwise('home');
}]);


var app = angular.module('flapperNews', []);

app.controller('MainCtrl', ['$scope', function($scope) {
		$scope.test = 'Hello World';
		$scope.posts = [
			{title: 'post 1', upvotes: 5},
			{title: 'post 2', upvotes: 2},
			{title: 'post 3', upvotes: 52},
			{title: 'post 4', upvotes: 28},
			{title: 'post 5', upvotes: 0}
		];
		$scope.addPost = function() {
			$scope.posts.push({title: 'A New Post!', upvotes: 0});
		}
}]);
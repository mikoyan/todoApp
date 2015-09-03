// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var todoApp = angular.module('starter', ['ionic', 'ngCordova']);

// Database for this App.
db = null;

todoApp.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

todoApp.config(function($stateProvider ,$urlRouterProvider){
  $stateProvider
    .state("config", {
      url: "/config",
      templateUrl: "templates/config.html",
      controller: "ConfigController",
    })
    .state("categories", {
      url: "/categories",
      templateUrl: "templates/categories.html",
      controller: "CategoriesController",
    })
    .state("lists", {
      url: "/lists/:categoryId",
      templateUrl: "templates/lists.html",
      controller: "ListsController",
    })
    .state("items", {
      url: "/items/:listId",
      templateUrl: "templates/items.html",
      controller: "ItemsController",
    });

    // Set Default to /config.
    $urlRouterProvider.otherwise("/config");
});

/**
 * Config - Copy prepopulated DB
 *
 * Directives:
 *   'ionicLoading'  UI-Progresss during dbCopy
 *   'cordovaSQLite' cordovaSQLite-Plugin)
 *   'location'      current Location in th ui-router
 *   'ionicPlatform' PlatformProvider
 */
todoApp.controller("ConfigController", function($scope, $ionicLoading, $cordovaSQLite, $location, $ionicHistory, $ionicPlatform) {
  // Deny Backbutton in next view so that the user does not rerun this.
  $ionicHistory.nextViewOptions({
    disableAnimate: true,
    disableBack: true
  });

  // Wait for the application to be ready (want to use Plugins).
  $ionicPlatform.ready(function(){
    // Show "Loading" until complete.
    $ionicLoading.show({template: "Loading..."});
    // Load SQLite on Device, use WebSQL in Browser.
    if(window.cordova) {
      window.plugins.sqlDB.copy("prepopulated.db", function() {
        // Copy-Success -> open DB
        db = $cordovaSQLite.openDB("prepopulated.db");
        // End Loading
        $ionicLoading.hide();
        // Navigate away to categories
        $location.path("/categories");
      }, function(error) {
        // Copy-Error.
        db = $cordovaSQLite.openDB("prepopulated.db");
        // End Loading
        $ionicLoading.hide();
        // Navigate away to categories
        $location.path("/categories");
      });
    } else {
      db = openDatabase("websql.db", "1.0", "My WebSQL Database", 2*1024*1024);
      db.transaction(function(tx) {
        // Drop Categories before import.
        tx.executeSql("DROP TABLE IF EXISTS tblCategories");

        // Create all necessary tables.
        tx.executeSql("CREATE TABLE IF NOT EXISTS tblCategories (id integer primary key, category_name text)");
        tx.executeSql("CREATE TABLE IF NOT EXISTS tblTodoLists (id integer primary key, category_id integer, todo_list_name text)");
        tx.executeSql("CREATE TABLE IF NOT EXISTS tblTodoListItems (id integer primary key, todo_list_id integer, todo_list_item_name text)");

        // Insert Default Categories.
        tx.executeSql("INSERT INTO tblCategories (category_name) VALUES (?)", ["Shopping"])
        tx.executeSql("INSERT INTO tblCategories (category_name) VALUES (?)", ["Chores"])
        tx.executeSql("INSERT INTO tblCategories (category_name) VALUES (?)", ["School"])
      });
      // Hide Loader when the transactions are finished.
      $ionicLoading.hide();
      $location.path("/categories");
    }
  })
});

/**
 * Controller for the Categories.
 * Directives:
 *  ionicPlatform   PlatformProvider
 *  cordovaSQLite
 */
todoApp.controller("CategoriesController", function($scope, $ionicPlatform, $cordovaSQLite){
  // Container for the categories in this Scope.
  $scope.categories = [];

  // Query Database for Categiories when the platform is ready.
  $ionicPlatform.ready(function() {
    var query = "SELECT id, category_name FROM tblCategories";
    $cordovaSQLite.execute(db, query, []).then(function(result) {
      if(result.rows.length > 0) {
        for(var i=0; i<result.rows.length;i++) {
          $scope.categories.push(
            {
              id: result.rows.items(i).id,
              category_name: result.rows.items(i).category_name
            }
          );
        }
      }
    }, function(error) {
      console.error(error);
    });
  });
});

/**
 * Controller for the Lists.
 * Directives:
 *  ionicPlatform   PlatformProvider
 *  cordovaSQLite   cordovaSQLite-Plugin
 *  stateParams     Query-Parameters from ui-router.
 */
todoApp.controller("ListsController", function($scope, $ionicPlatform, $cordovaSQLite, $stateParams){
  // Container for the lists in this Scope.
  $scope.lists = [];

  // Query Database for Lists when the platform is ready.
  $ionicPlatform.ready(function() {
    var query = "SELECT id, category_id, todo_list_name FROM tblTodoLists WHERE category_id = ?";
    $cordovaSQLite.execute(db, query, [$stateParams.categoryId]).then(function(result) {
      if(result.rows.length > 0) {
        for(var i=0; i<result.rows.length;i++) {
          $scope.lists.push(
            {
              id: result.rows.items(i).id,
              category_id: result.rows.items(i).category_id,
              todo_list_name: result.rows.items(i).todo_list_name
            }
          );
        }
      }
    }, function(error) {
      console.error(error);
    });
  });
});

/**
 * Controller for the Items.
 * Directives:
 *  ionicPlatform   PlatformProvider
 *  cordovaSQLite
 */
todoApp.controller("ItemsController", function($scope, $ionicPlatform, $cordovaSQLite){

});

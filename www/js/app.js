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
 */
todoApp.controller("ConfigController", function($scope, $ionicLoading, $cordovaSQLite, $location){
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

todoApp.controller("CategoriesController", function($scope){

});

todoApp.controller("ListsController", function($scope){

});

todoApp.controller("ItemsController", function($scope){

});

// first attempt at angular.js
// ksankar | March 25 | http://ksankar.in

var app = angular.module('dashboard', []);

//refresh date time
app.controller('dateCard', function($scope, $interval) {
  updateDate();
  $interval(updateDate, 1000);
  
  function updateDate() {
    $scope.ld = new Date().toDateString();
    $scope.lt = new Date().toLocaleTimeString();   
  }
});

//To-DO List
app.controller('toDoCard', function($scope, $rootScope, $timeout) {
  
  var today = curDate();
  loadList(); // load from local storage

  if (!$scope.toDoList) {
    //dummy values
    $scope.toDoList = [{
      desc: 'My first angular js page',
      done: false,
      due: '',
      dt: today
    }, {
      desc: 'Yippe! Exciting!! :D',
      done: false,
      due: 'Mar 30, 2016',
      dt: today
    }];
  };

  //defaults
  $scope.addMode = false;
  $scope.newItem = {
    desc: '',
    done: false,
    due: '',
    dt: today
  };  

  //add new item to list
  $scope.addItem = function() {
    $scope.toDoList.push($scope.newItem);
    $scope.newItem = {
      desc: '',
      done: false,
      due: '',
      dt: curDate()
    };
    $scope.toggleForm();
    saveList();
  };

  //toggle add/view mode
  $scope.toggleForm = function() {
    $scope.addMode = !$scope.addMode;
  };

  //clear completed items
  $scope.clearDoneItems = function() {
    var curList = $scope.toDoList;
    $scope.toDoList = [];
    angular.forEach(curList, function(item) {
      if (!item.done) {
        console.log('sss', item);
        $scope.toDoList.push(item);
      }
    });
    //temp workaround from MDL checkbox js issue
    document.querySelector('.is-checked').MaterialCheckbox.uncheck();
    saveList();
  };

  function saveList() {
    localStorage.setItem('toDoList', JSON.stringify($scope.toDoList));
    toastThis('Data saved on browser storage.')
  }

  function loadList() {
    var x = localStorage.getItem('toDoList');
    if (x != null) {
      $scope.toDoList = JSON.parse(x);
    }
    toastThis('Data loaded from browser storage.');
  }

  function curDate() {
    var n = Date.now();
    return n;
  };

  //toast status messages
  function toastThis(msg) {
    $rootScope.toast = {
      msg: msg,
      show: true
    };
    $timeout(function() {
      $rootScope.toast.show = false;
    }, 2000);
  }

});


//location card
app.controller('locCard', function($scope, $http, $rootScope) {

  $scope.getLoc = function() {
    $scope.myLoc = '';
    //jsonp is required for cross origin requests.
    $http.jsonp("http://ip-api.com/json/?callback=JSON_CALLBACK").
    success(function(data) {
      $scope.myLoc = data;
      console.log('data', data);
      $rootScope.loc = {
        'lat': $scope.myLoc.lat,
        'lon': $scope.myLoc.lon
      };
      //update weather now that we have location
      $rootScope.$emit('updateWeather');
    }).
    error(function(data) {
      $scope.myLoc = "Request failed";
    });
  };

  $scope.getLoc();
});


//weather card
app.controller('myWeather', function($scope, $http, $rootScope) {

   //allow cross controller calls. 
  $rootScope.$on('updateWeather', function() {
    $scope.getWeather();
  });

  //please don't copy my appid key
  $scope.getWeather = function() {
    $scope.wForecast = '';
    var city = $rootScope.loc;
    $http.jsonp("http://api.openweathermap.org/data/2.5/weather?lat=" + city.lat + "&lon=" + city.lon + "&units=metric&appid=cb2fc62670268fdf35840e3a26300191&callback=JSON_CALLBACK", {
      dataType: 'json'
    }).
    success(function(data) {
      $scope.wForecast = {
        'humidity': data.main.humidity,
        'temp': data.main.temp,
        'abs': data.weather[0]
      };
      console.log('data', data);
    }).
    error(function(data) {
      $scope.woeid = "Request failed";
      console.log('data', data);
    });
  };

});

//have some fun
app.controller('userProfile', function($scope) {

  loadProfile();
  $scope.editMode = true;
  if (!$scope.profile) {    
    $scope.profile = {
      'fid': 1
    };
  }

  $scope.goToNext = function() {
    $scope.profile.fid++;
    if ($scope.profile.fid == 4) {
      saveProfile();
    }
  };

  $scope.editProfile = function() {    
    $scope.editMode = !$scope.editMode;
  };

  $scope.resetProfile = function() {
    $scope.profile = {
      'fid': 1
    };
    localStorage.removeItem('userProfile');
    $scope.editMode = true;
  };

  function saveProfile() {
    localStorage.setItem('userProfile', JSON.stringify($scope.profile));
  }

  function loadProfile() {
    var x = localStorage.getItem('userProfile');
    if (x != null) {
      $scope.profile = JSON.parse(x);
    }
  }

});

app.controller('colorMe', function($scope,$rootScope) {  
  // Durstenfeld shuffle
  $scope.shuffleClr = function() {  
    for (var i = $rootScope.bgClr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = $rootScope.bgClr[i];
      $rootScope.bgClr[i] = $rootScope.bgClr[j];
      $rootScope.bgClr[j] = temp;
    }
   };
  
});

// Material design lite isn't fine with dynamic reconstruction of pages.
// The mutation observer makes sure that all new fileds are registered with MDL
app.run(function($rootScope) {
  var mdlUpgradeDom = false;
  setInterval(function() {
    if (mdlUpgradeDom) {
      componentHandler.upgradeDom();
      mdlUpgradeDom = false;
    }
  }, 200);

  var observer = new MutationObserver(function() {
    mdlUpgradeDom = true;
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  /* support <= IE 10
  angular.element(document).bind('DOMNodeInserted', function(e) {
      mdlUpgradeDom = true;
  });
  */
  
  // globals
  $rootScope.bgClr = ['x0','x1','x2','x3','x4','x5'];
  
});
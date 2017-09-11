"use strict";
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.controller('MainCtrl', 
  [
    "$scope",
    "$http",
    "$timeout",
    "$window",
    "$ionicPopup",
    "$ionicLoading",
    "$ionicModal",
    
    function($scope, $http, $timeout, $window,$ionicPopup, $ionicLoading, $ionicModal) {
      var inputData = $scope.inputData = {
        word_1: "",
        word_2: "",
        word_3: "",
        engine: "Google",
      };
      $scope.resultsReady = false;
      //$scope.resultsReady = true;

      var partial_res = {
        prob_1: null,
        prob_2: null,
        prob_3: null,
        prob_1_2: null,
        prob_1_3: null,
        N: 4000000000,
      };

      var cur_results = $scope.cur_results = null;

      $ionicModal.fromTemplateUrl('modal-ris.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
      });

      $scope.openModal = function() {
        $scope.modal.show();
      };
      $scope.closeModal = function() {
        $scope.modal.hide();
      };

      $ionicModal.fromTemplateUrl('modal-grafico.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal2 = modal;
      });

      $scope.openModal2 = function() {
        $scope.modal2.show();
        drawGraphs();
      };
      $scope.closeModal2 = function() {
        $scope.modal2.hide();
      };

      function drawGraphs() {
          var canvas = document.getElementById('conf_canvas');
          canvas.width  = $window.innerWidth; 
          canvas.height = 600;
          canvas = document.getElementById('pmi_canvas');
          canvas.width  = $window.innerWidth; 
          canvas.height = 600;

          var p1y = +document.getElementById("conf_canvas").getAttribute("height") / 2;
          var p1x = 50;
          var p2y = 50
          var p2x = +document.getElementById("conf_canvas").getAttribute("width") - 30;
          var p3y = +document.getElementById("conf_canvas").getAttribute("height") - 50;
          var p3x = +document.getElementById("conf_canvas").getAttribute("width") - 30;

          var conf12 = $scope.cur_results.conf_1_2;
          var conf13 = $scope.cur_results.conf_1_3;

          var pmi12 = $scope.cur_results.pmi_1_2;
          var pmi13 = $scope.cur_results.pmi_1_3;

          function confidence(conf12, conf13)
          {
            
            var newP2X_Conf = 50 + (+document.getElementById("conf_canvas").getAttribute("width") - 80) * Math.pow(10,conf12-1);
            var newP3X_Conf = 50 + (+document.getElementById("conf_canvas").getAttribute("width") - 80) * Math.pow(10,conf13-1);

            if(newP2X_Conf > +document.getElementById("conf_canvas").getAttribute("width") - 30)

              newP2X_Conf = +document.getElementById("conf_canvas").getAttribute("width") - 30;

            if(newP3X_Conf > +document.getElementById("conf_canvas").getAttribute("width") - 30)

              newP3X_Conf = +document.getElementById("conf_canvas").getAttribute("width") - 30;

            var newP2y_Conf = (((p2y-p1y)*(newP2X_Conf-p1x))/(p2x-p1x))+p1y;
            var newP3y_Conf = (((p3y-p1y)*(newP3X_Conf-p1x))/(p3x-p1x))+p1y;

            return [newP2X_Conf, newP2y_Conf, newP3X_Conf, newP3y_Conf];

          }

          function pmi(pmi12, pmi13)
          {
            var max_pmi = 0;
            var min_pmi = 0;
            var newP2X_Pmi = 0;
            var newP3X_Pmi = 0;

            if(partial_res.prob_1 == 0 || partial_res.prob_2 == 0)
              pmi12=0.1;
            if(partial_res.prob_1 == 0 || partial_res.prob_3 == 0)
              pmi13=0.1;

            max_pmi = Math.max(pmi12,pmi13);
            min_pmi = Math.min(pmi12,pmi13);

            var coff_pmi = min_pmi/max_pmi;

            
            
            if(pmi12<0 && pmi13<0)
            {
              pmi12=-pmi12;
              pmi13=-pmi13;
              min_pmi=Math.max(pmi13, pmi12);
              max_pmi=Math.min(pmi13, pmi12);
            }
            else if(pmi13<0 || pmi12<0)
            {
              max_pmi=Math.max(pmi12, pmi13);
              min_pmi=Math.min(pmi12, pmi13);
              min_pmi=-min_pmi;
            
              if(min_pmi > max_pmi)
              {
                  min_pmi= 0.1;
              }
            }
              if(max_pmi == pmi12)
              {
                newP2X_Pmi = p2x;
                if(pmi13 == 0)
                  pmi13 = p1x + 20;
                else 
                {
                  newP3X_Pmi = p3x * coff_pmi;
                  if(newP3X_Pmi<p1x)
                    newP3X_Pmi=p1x+20;
                }
              }
              else
              {
                newP3X_Pmi = p3x;
                if(pmi12 == 0)
                  pmi12 = p1x + 20;
                else
                {
                  newP2X_Pmi = p2x * coff_pmi;
                    if(newP2X_Pmi<p1x)
                      newP2X_Pmi=p1x+20;
                }
              }
            
          var newP2y_Pmi = (((p2y-p1y)*(newP2X_Pmi-p1x))/(p2x-p1x))+p1y;
          var newP3y_Pmi = (((p3y-p1y)*(newP3X_Pmi-p1x))/(p3x-p1x))+p1y;
          
          return [newP2X_Pmi, newP2y_Pmi, newP3X_Pmi, newP3y_Pmi];

          }

          function circle(x_conf, y_conf, x_pmi, y_pmi, radius ,color)
          {
            ctx.beginPath();
            ctx.arc(x_conf,y_conf,radius,0,2*Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
            
            
            ctx2.beginPath();
            ctx2.arc(x_pmi,y_pmi,radius,0,2*Math.PI);
            ctx2.fillStyle = color;
            ctx2.fill();
            
            
          }

          function red_circle(x, y, radius)
          {
            ctx.beginPath();
            ctx.arc(x,y,radius,0,2*Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
            
            
            ctx2.beginPath();
            ctx2.arc(x,y,radius,0,2*Math.PI);
            ctx2.fillStyle = 'red';
            ctx2.fill();
            
            
          }

          function draw_line(x1,y1,x2_conf,y2_conf, x2_pmi, y2_pmi)
          {
            ctx.moveTo(x1,y1);
            ctx.lineTo(x2_conf,y2_conf);
            ctx.lineWidth = 5;
            ctx.stroke();

            ctx2.moveTo(x1,y1);
            ctx2.lineTo(x2_pmi,y2_pmi);
            ctx2.lineWidth = 5;
            ctx2.stroke();
            
          }

          function draw_text(parola,x,y)
          {
            ctx.font = "17px Arial";
            ctx.fillStyle = "black";
            ctx.fillText(parola,x,y);

            
            ctx2.font = "17px Arial";
            ctx2.fillStyle = "black";
            ctx2.fillText(parola,x,y);
          }


          var ris_Conf = confidence(conf12, conf13);
          var ris_Pmi = pmi(pmi12, pmi13);


          var c = document.getElementById("conf_canvas");
          var ctx = c.getContext("2d");

          var d = document.getElementById("pmi_canvas");
          var ctx2 = d.getContext("2d");

          confidence(conf12,conf13);
          pmi(pmi12, pmi13);

          console.log(ris_Conf);
          console.log(ris_Pmi);


          draw_line(p1x,p1y,ris_Conf[0],ris_Conf[1], ris_Pmi[0], ris_Pmi[1]);
          draw_line(p1x,p1y,ris_Conf[2],ris_Conf[3], ris_Pmi[2], ris_Pmi[3]);

          red_circle(p1x,p1y,13);
          circle(ris_Conf[0],ris_Conf[1], ris_Pmi[0],ris_Pmi[1], 13,'blue');
          circle(ris_Conf[2],ris_Conf[3], ris_Pmi[2],ris_Pmi[3], 13, 'green');
          circle(15,15,15,15,10,'red');
          circle(15,40,15,40,10,'blue');
          circle(15,65,15,65,10,'green');
          draw_text(inputData.word_1,30,20);
          draw_text(inputData.word_2,30,45);
          draw_text(inputData.word_3,30,70);

      }


      function checkRes(results) {
        let complete = true;
        for (let key in results) {
          complete = complete && results[key] !== null;
        }
        return complete;
      }
      
      $scope.cerca = function() {

        if (inputData.word_1 == "" || inputData.word_2 == "" || inputData.word_3 == "" )
        {
          $ionicPopup.alert({
                title: 'Errore',
                template: 'I campi sono tutti obbligatori'
              });
          return;
        }
        if (inputData.word_1.length >= 30  || inputData.word_2.length >= 30 || inputData.word_3.length >= 30 )
        {
          $ionicPopup.alert({
                title: 'Error',
                template: 'La lunghezza delle parole non deve superare i 30 caratteri'
              });
          return;
        }

        
        partial_res = {
          prob_1: null,
          prob_2: null,
          prob_3: null,
          prob_1_2: null,
          prob_1_3: null,
          N: 4000000000,
        };
        cur_results = null;
        $scope.cur_results = null;

        if (inputData.engine === "Google") {
          $ionicLoading.show({ template: 'Loading...' });

          $http.get(
            `https://www.googleapis.com/customsearch/v1?key=AIzaSyAT8xf1naXjQppfCXjejK8C_YBx4SVUGwo&cx=001817621475762262756:bqfscwkkevq&q=${inputData.word_1}`)
          .then(
            function (response) {
              partial_res.prob_1 = response.data.queries.request[0].totalResults;
              if (checkRes(partial_res)) {
                $ionicLoading.hideprob_3
                $scope.resultsReady = true;
              }
            }, 
            function (response) {
              $ionicLoading.hide();
              $ionicPopup.alert({
                title: 'Errore',
                template: 'La chiamata a Google ha restituito errore...'
              });
              console.error("Something went wrong...", response);
            }
          );
          $http.get(
            `https://www.googleapis.com/customsearch/v1?key=AIzaSyAT8xf1naXjQppfCXjejK8C_YBx4SVUGwo&cx=001817621475762262756:bqfscwkkevq&q=${inputData.word_2}`)
          .then(
            function (response) {
              partial_res.prob_2 = response.data.queries.request[0].totalResults;
              if (checkRes(partial_res)) {
                $ionicLoading.hide();
                $scope.resultsReady = true;
              }
            }, 
            function (response) {
              $ionicLoading.hide();
              $ionicPopup.alert({
                title: 'Errore',
                template: 'La chiamata a Google ha restituito errore...'
              });
              console.error("Something went wrong...", response);
            }
          );
          $http.get(
            `https://www.googleapis.com/customsearch/v1?key=AIzaSyAT8xf1naXjQppfCXjejK8C_YBx4SVUGwo&cx=001817621475762262756:bqfscwkkevq&q=${inputData.word_3}`)
          .then(
            function (response) {
              partial_res.prob_3 = response.data.queries.request[0].totalResults;
              if (checkRes(partial_res)) {
                $ionicLoading.hide();
                $scope.resultsReady = true;
              }
            }, 
            function (response) {
              $ionicLoading.hide();
              $ionicPopup.alert({
                title: 'Errore',
                template: 'La chiamata a Google ha restituito errore...'
              });
              console.error("Something went wrong...", response);
            }
          );
          $http.get(
            `https://www.googleapis.com/customsearch/v1?key=AIzaSyAT8xf1naXjQppfCXjejK8C_YBx4SVUGwo&cx=001817621475762262756:bqfscwkkevq&q=${inputData.word_1}+${inputData.word_2}`)
          .then(
            function (response) {
              partial_res.prob_1_2 = response.data.queries.request[0].totalResults;
              if (checkRes(partial_res)) {
                $ionicLoading.hide();
                $scope.resultsReady = true;
              }
            }, 
            function (response) {
              $ionicLoading.hide();
              $ionicPopup.alert({
                title: 'Errore',
                template: 'La chiamata a Google ha restituito errore...'
              });
              console.error("Something went wrong...", response);
            }
          );
          $http.get(
            `https://www.googleapis.com/customsearch/v1?key=AIzaSyAT8xf1naXjQppfCXjejK8C_YBx4SVUGwo&cx=001817621475762262756:bqfscwkkevq&q=${inputData.word_1}+${inputData.word_3}`)
          .then(
            function (response) {
              partial_res.prob_1_3 = response.data.queries.request[0].totalResults;
              if (checkRes(partial_res)) {
                $ionicLoading.hide();
                $scope.resultsReady = true;
              }
            }, 
            function (response) {
              $ionicLoading.hide();
              $ionicPopup.alert({
                title: 'Error',
                template: 'La chiamata a Google ha restituito errore...'
              });
              console.error("Something went wrong...", response);
            }
          );
        }

        else if (inputData.engine === "Bing")
        {

          $ionicLoading.show({ template: 'Loading...' });

          $http({
            method: 'GET',
            url: `https://api.cognitive.microsoft.com/bing/v5.0/news/search?q=${inputData.word_1}%27&$format=json`,
            headers: {
                'Ocp-Apim-Subscription-Key': "ad0f619474644b9487063613e82ae36e"
              }
            }).then(function(response) 
            {
              console.log(response);
              partial_res.prob_1 = response.data.totalEstimatedMatches;
              if (checkRes(partial_res)) 
              {
              $ionicLoading.hide();
              $scope.resultsReady = true;
              }
            }, 
            function (response) {
              $ionicLoading.hide();
              $ionicPopup.alert({
                title: 'Errore',
                template: 'La chiamata a Bing ha restituito errore...'
              });
              console.error("Something went wrong...", response);
            });

            $http({
            method: 'GET',
            url: `https://api.cognitive.microsoft.com/bing/v5.0/news/search?q=${inputData.word_2}%27&$format=json`,
            headers: {
                'Ocp-Apim-Subscription-Key': "ad0f619474644b9487063613e82ae36e"
              }
            }).then(function(response) 
            {
              partial_res.prob_2 = response.data.totalEstimatedMatches;
              if (checkRes(partial_res)) 
              {
              $ionicLoading.hide();
              $scope.resultsReady = true;
              }
            }, 
            function (response) {
              $ionicLoading.hide();
              $ionicPopup.alert({
                title: 'Errore',
                template: 'La chiamata a Bing ha restituito errore...'
              });
              console.error("Something went wrong...", response);
            });

            $http({
            method: 'GET',
            url: `https://api.cognitive.microsoft.com/bing/v5.0/news/search?q=${inputData.word_3}%27&$format=json`,
            headers: {
                'Ocp-Apim-Subscription-Key': "ad0f619474644b9487063613e82ae36e"
              }
            }).then(function(response) 
            {
              partial_res.prob_3 = response.data.totalEstimatedMatches;
              if (checkRes(partial_res)) 
              {
              $ionicLoading.hide();
              $scope.resultsReady = true;
              }
            }, 
            function (response) {
              $ionicLoading.hide();
              $ionicPopup.alert({
                title: 'Errore',
                template: 'La chiamata a Bing ha restituito errore...'
              });
              console.error("Something went wrong...", response);
            });

            $http({
            method: 'GET',
            url: `https://api.cognitive.microsoft.com/bing/v5.0/news/search?q=${inputData.word_1}%20${inputData.word_2}%27&$format=json`,
            headers: {
                'Ocp-Apim-Subscription-Key': "ad0f619474644b9487063613e82ae36e"
              }
            }).then(function(response) 
            {
              partial_res.prob_1_2 = response.data.totalEstimatedMatches;
              if (checkRes(partial_res)) 
              {
              $ionicLoading.hide();
              $scope.resultsReady = true;
              }
            }, 
            function (response) {
              $ionicLoading.hide();
              $ionicPopup.alert({
                title: 'Errore',
                template: 'La chiamata a Bing ha restituito errore...'
              });
              console.error("Something went wrong...", response);
            });

            $http({
            method: 'GET',
            url: `https://api.cognitive.microsoft.com/bing/v5.0/news/search?q=${inputData.word_1}%20${inputData.word_3}%27&$format=json`,
            headers: {
                'Ocp-Apim-Subscription-Key': "ad0f619474644b9487063613e82ae36e"
              }
            }).then(function(response) 
            {
              partial_res.prob_1_3 = response.data.totalEstimatedMatches;
              if (checkRes(partial_res)) 
              {
              $ionicLoading.hide();
              $scope.resultsReady = true;
              }
            }, 
            function (response) {
              $ionicLoading.hide();
              $ionicPopup.alert({
                title: 'Errore',
                template: 'La chiamata a Bing ha restituito errore...'
              });
              console.error("Something went wrong...", response);
            });
        }
        
      };

      function genera_risultati(){
        if (cur_results === null) {
          cur_results = {
            partial_res: partial_res,
            conf_1_2: partial_res.prob_1_2 / partial_res.prob_1,
            conf_1_3: partial_res.prob_1_3 / partial_res.prob_1,
            pmi_1_2: Math.log((partial_res.prob_1_2 * partial_res.N) / (partial_res.prob_1 * partial_res.prob_2)),
            pmi_1_3: Math.log((partial_res.prob_1_3 * partial_res.N) / (partial_res.prob_1 * partial_res.prob_3))
          };
          $scope.cur_results = cur_results;
        }
      }

      $scope.risultati = function() {
        console.log(partial_res)
        genera_risultati();
        console.log(cur_results)
        $timeout($scope.openModal, 0);
      };

      $scope.grafico = function() {
        genera_risultati();
        $timeout($scope.openModal2, 0);
      }

    }
  ]);

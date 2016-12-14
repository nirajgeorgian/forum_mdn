var jsonData =  {
    "particles": {
      "number": {
        "value": 60
      },
      "color": {
        "value": "random"
      },
      "shape": {
        "type": "circle",
        "stroke": {
          "width": 6,
          "color": "#222222"
        }
      },
      "size": {
        "value": 10,
        "random": true
      },
      "line_linked": {
        "enable": true,
        "distance": 200,
        "opacity": 1,
        "color": "#233953"
      },
      "move": {
        "enable": true,
        "speed": 5,
        "direction": "random",
        "straight": false
      }
    },
    "interactivity": {

    }
  }



  var str = JSON.stringify(jsonData);
  var parsedData = JSON.parse(str);
  console.log(parsedData);
  particlesJS("particles-js", parsedData);

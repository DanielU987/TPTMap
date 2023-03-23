import Layer from '/ol/layer/Layer.js';
import Map from '/ol/Map.js';
import View from '/ol/View.js';
import { composeCssTransform } from '/ol/transform.js';

//let MapName = '0.svg';
//let MapPath = './imgs/maps/A/' + MapName;
//let MapPath = '/imgs/maps/A/0.svg';
//
let MapPath = window.mapUrl;
const map = new Map({
  target: 'map',
  view: new View({
    center: [0, 0],
    projection: 'EPSG:4326',
    zoom: 4.6,
    minZoom: 4,
    maxZoom: 6,
  }),
});
//<object data="imgs/B0.svg" type="image/svg+xml" id="bitmapsvg" width="100%" height="100%"></object>
const svgContainer = document.createElement('div');
const xhr = new XMLHttpRequest();
xhr.open('GET', MapPath);
xhr.addEventListener('load', function () {
  const svg = xhr.responseXML.documentElement;
  svgContainer.ownerDocument.importNode(svg);
  svgContainer.appendChild(svg);
});
xhr.send();

const width = window.innerWidth;
const height = window.innerHeight;
//const svgResolution = 360 / width;
const svgResolution = 100 / width;
//svgContainer.style.width = width/2 + 'px';
svgContainer.style.width = width + 'px';
svgContainer.style.height = height + 'px';
//svgContainer.style.transformOrigin = 'top left';
svgContainer.className = 'svg-layer';

map.addLayer(
  new Layer({
    render: function (frameState) {
      const scale = svgResolution / frameState.viewState.resolution;
      const center = frameState.viewState.center;
      const size = frameState.size;
      const cssTransform = composeCssTransform(
        0, // start x
        -100, // start y
        scale, // for zooming (from frameState)
        scale, // 
        frameState.viewState.rotation, // rotation
        -center[0] / svgResolution, // move left (-)
        center[1] / svgResolution //move up (-)
      );
      svgContainer.style.transform = cssTransform;
      svgContainer.style.opacity = this.getOpacity();
      return svgContainer;
    },
  })
);

map.once('rendercomplete', function (event) {
  var stily = "fill:rgb(10, 116, 245);stroke:rgb(10, 116, 245); stroke-width:2;fill-opacity:0.7"
  var Mesto = String(window.location.href)
  var klass = Mesto.slice(-4)

  if (klass.charAt(0) == "A" || klass.charAt(0) == "B") {
    var floor = klass.charAt(1)
    var building = klass.charAt(0)
    console.log(klass)
    var activeFloor = document.getElementById("floor" + floor.toString())
    activeFloor.classList.add("active-right-tab")
    var activeBuilding = document.getElementById("building" + building.toString())
    activeBuilding.classList.add("active-right-tab")
    var delta = document.getElementById(klass); // klass
    console.log("Klass: " + klass);
    console.log(delta);

    delta.style = stily
    var k = delta.children.length
    console.log(k)
    if (k > 0) {
      for (i = 0; i < k; i++) {
        delta.children[i].style = stily
      }
    } else {
      delta.style = stily
    }
  }
  console.log(klass)
  if (klass.charAt(0) == "/") {
    var floor = klass.charAt(3)
    var building = klass.charAt(1)
    console.log(building)
    console.log(floor)
    var activeFloor = document.getElementById("floor" + floor.toString())
    activeFloor.classList.add("active-right-tab")
    var activeBuilding = document.getElementById("building" + building.toString())
    activeBuilding.classList.add("active-right-tab")
  }
});
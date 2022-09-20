// these are the variables you can use as inputs to your algorithms
console.log(fxhash)   // the 64 chars hex number fed to your algorithm
console.log(fxrand()) // deterministic PRNG function, use it instead of Math.random()

// note about the fxrand() function 
// when the "fxhash" is always the same, it will generate the same sequence of
// pseudo random numbers, always

//----------------------
// defining features
//----------------------
// You can define some token features by populating the $fxhashFeatures property
// of the window object.
// More about it in the guide, section features:
// [https://fxhash.xyz/articles/guide-mint-generative-token#features]

//
// window.$fxhashFeatures = {
//   "Background": "Black",
//   "Number of lines": 10,
//   "Inverted": true
// }

// this code writes the values to the DOM as an example
const container = document.createElement("div")
container.innerText = `
  random hash: ${fxhash}\n
  some pseudo random values: [ ${fxrand()}, ${fxrand()}, ${fxrand()}, ${fxrand()}, ${fxrand()},... ]\n
`
document.body.prepend(container)

window.$fxhashFeatures = {};

// https://stackoverflow.com/a/14731922/953010
/**
 * Conserve aspect ratio of the original region. Useful when shrinking/enlarging
 * images to fit into a certain area.
 *
 * @param {Number} srcWidth width of source image
 * @param {Number} srcHeight height of source image
 * @param {Number} maxWidth maximum available width
 * @param {Number} maxHeight maximum available height
 * @return {Object} { width, height }
 */
function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
  var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

  return { width: srcWidth * ratio, height: srcHeight * ratio };
}

function render() {
  onScreenCtx.drawImage(offScreen, 0, 0, onScreen.width, onScreen.height);
}

function onWindowResize() {
  let ratio = calculateAspectRatioFit(offScreen.width, offScreen.height, window.innerWidth, window.innerHeight);

  onScreen.width = ratio.width;
  onScreen.height = ratio.height;

  render();
}
window.addEventListener('resize', onWindowResize, false);

let toLoad = 0;

const regex = /\d+(-\([\w-]+\))?-(.+)/;
let options=[]
let branch={}

Object.keys(jsondata)
  .sort((a, b) => parseInt(a.split('-')[0]) - parseInt(b.split('-')[0]))
  .forEach(elem => {
      options.push([elem, parseInt(elem.split('-')[0])]);
    });

branch = getWeightedOption(options);
window.$fxhashFeatures[branch.split('-')[1]] = branch.split('-')[2].replaceAll('_', ' ');

if (jsondata['00-background']) jsondata[branch]['00-background'] = jsondata['00-background']['00-background']
Object.keys(jsondata[branch])
  .filter(key => jsondata[branch][key].length)
  .sort((a, b) => parseInt(a.split('-')[0]) - parseInt(b.split('-')[0]))
  .forEach(key => {
    toLoad++; // Count each layer (not image) that has yet to be loaded
    options = [];
    jsondata[branch][key].forEach(elem => {
      options.push([elem, parseInt(elem.split('-')[0])]);
    });

    // Select value for attribute
    let selected = getWeightedOption(options);
    const layerOptions = {};

    const r = regex.exec(key);
    let optionString = r[1];
    const layerName = r[2];

    if (optionString) {
      optionString = optionString.substring(2, optionString.length - 1);
      optionArray = optionString.split('_');

      for (const option of optionArray) {
        let currOption = option.split('-');

        let flag = currOption.shift();
        let value;

        if (currOption.length) {
          value = currOption.join('-');
        }

        if (value) {
          layerOptions[flag] = value;
        } else {
          layerOptions[flag] = true;
        }
      }
    }

    if (!layerOptions.hide) {
      window.$fxhashFeatures[layerName] = selected.split('-').splice(1).join('-').replacei('.png', '').replaceAll('_', ' ');
    }

    let selectedLayerImage = new Image();
    selectedLayerImage.addEventListener('load', function () {
      // If no size is set,
      // use first image to determine
      if (!imageSizeSet) {
        imageSizeSet = true;

        offScreen.width = selectedLayerImage.width;
        offScreen.height = selectedLayerImage.height;

        window.dispatchEvent(new Event('resize'));
      }

      offScreenLayered.render();
      render();

      toLoad--;
      if (toLoad == 0) {
        fxpreview();
      }
    }, false);
    if (key === '00-background') {
      selectedLayerImage.src = './layers/' + key + '/' + key + '/' + selected;
    } 
    else selectedLayerImage.src = './layers/' + branch + '/' + key + '/' + selected;

    let layerObj = {
      id: key,
      show: true,
      render: function (canvas, ctx) {
        if (layerOptions.blend) {
          ctx.globalCompositeOperation = layerOptions.blend;
        } else {
          ctx.globalCompositeOperation = 'source-over';
        }

        ctx.drawImage(selectedLayerImage, 0, 0, canvas.width, canvas.height);
      }
    };

    offScreenLayered.addLayer(layerObj);
  });

console.log(window.$fxhashFeatures);


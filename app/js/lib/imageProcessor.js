import createFile, { readFile } from './jsonHelper';
import { FILE_NAME } from '../config/constants';
/**
 * 
 * @param {*} imgObj 
 * @param {*} canvasObj 
 * @param {*} options 
 */

export default function ImageProcessor(imgObj, canvasObj, options) {
  this.settings = {
      canvasId: "",
      wrapperSelector: ""
  };

  // valudate settings properties
  for(let key in options) {
    if (options.hasOwnProperty(key)) {
      this.settings[key] = options[key];
    }  
  }

  const { width: imgWidth, height: imgHeight, ratio } = this.getDimentions(canvasObj, imgObj);
  
  // set image data
  this.image = {
      file: imgObj.file,
      base64data: imgObj.src,
      width: imgWidth,
      height: imgHeight,
      ratio: ratio, 
      scale: 0.5
  };

  this.coord = {
    x: (canvasObj.width / 2) - (imgWidth / 2) * this.image.scale, 
    y: (canvasObj.height / 2) - (imgHeight / 2) * this.image.scale
  };

  // center of the image
  this.centerCoord = {
    x: (canvasObj.width / 2) - (imgWidth / 2) * this.image.scale, 
    y: (canvasObj.height / 2) - (imgHeight / 2) * this.image.scale
  }; 

  this.canvas = {
    element: canvasObj.element,
     height: canvasObj.height,
      width: canvasObj.width,
          x: 0,
          y: 0
  };
  this.init();
}

ImageProcessor.prototype = {
    init: function() {
      const wrapper     = document.querySelector(this.settings.wrapperSelector);
      const canvas      = this.canvas.element; 
      const ctx         = canvas.getContext('2d');
      
      // add the canvas to the object
      this.canvas.ctx = ctx;

      // clear canvas before redrawing
      this.clear();
      // do the drawing
      this.canvas.ctx.drawImage(this.image.file, this.coord.x, this.coord.y, this.image.width, this.image.height);
      
      const self = this;

      // save edited image to a json
      const submitBtn = wrapper.querySelector('.submit');
      submitBtn.addEventListener("click", function(event) {
        self.submit();
      });

      // import saved file
      const importBtn = wrapper.querySelector('.import');
      importBtn.addEventListener("click", function(event) {
        self.import();
      });

      // move left
      const leftBtn = wrapper.querySelector('.left');
      leftBtn.addEventListener("click", function(event) {
        self.moveLeft();
      });

      // move right
      const rightBtn = wrapper.querySelector('.right');
      rightBtn.addEventListener("click", function(event) {
        self.moveRight();
      });

      // image positioning top,right,bottom,left using mouse drag
      window.addEventListener("mouseup", function(event) {
        window.removeEventListener('mousemove', self.boundDrag, false);
      });

      canvas.addEventListener("mousedown", function(event) {
        self.dragStart(event);
      });

      // scale image
      const scale = wrapper.querySelector(".scale");
      scale.addEventListener('input', function(event) {
         let value = wrapper.querySelector(".scale").value;
         value = value / 100;
         self.scale(value); 
      });

      // reset canvas and the file input
      const resetBtn = wrapper.querySelector('.reset');
      resetBtn.addEventListener("click", function(event) {
        wrapper.querySelector('.files').value = null;
        self.clear();
      });
    },

    // get image min width and height
    getDimentions: function(canvas, imgObj) {
      const minWidth  = canvas.width * 2;
      const minHeight = minWidth;
        // create the aspect ratio 
      const ratio     = imgObj.width / imgObj.height; 
      
      // understand the orientation of the photo 
      let imgWidth  = imgObj.width;
      let imgHeight = imgObj.height;
      const isWidthGreater = imgObj.width > imgObj.height;

      if (isWidthGreater && imgHeight < minHeight) {
        imgHeight  = minHeight;
        imgWidth = imgHeight * ratio;
      } else if(isWidthGreater && imgWidth < minWidth) {
        imgWidth  = minWidth;
        imgHeight = imgWidth * ratio;
      } else if(isWidthGreater) {
        imgHeight = minHeight;
        imgWidth  = imgHeight * ratio;
      } else {
        imgWidth  = minWidth;
        imgHeight = imgWidth / ratio;
      }

      return { width: imgWidth, height: imgHeight, ratio }
    },

    // save canvas data to a json file
    submit: function() {
      const canvasObj = {
          canvas: {
              width: this.canvas.width,
              height: this.canvas.height,
              photo : {
                  id: this.image.base64data,
                  width: this.image.width,
                  height: this.image.height,
                  x: this.coord.x,
                  y: this.coord.y,
                  scale: this.image.scale,
                  ratio: this.image.ratio,
              }
          }
      }
      createFile(canvasObj);
    },

    // import saved file from storage
    import: function() {
      this.clear();
      readFile(FILE_NAME, (e) => this.setImage(e))
    },

    /**
     * @param {*} data - json data from file
     **/
    setImage: function(data) {
      const { canvas: { photo: savedImg }} = data;
      if (savedImg) {
        const image = new Image();
        image.src = savedImg.id;

        this.image = {
            file: image,
            base64data: savedImg.id,
            width: savedImg.width,
            height: savedImg.height,
            ratio: savedImg.ratio, 
            scale: savedImg.scale
        }; 

        this.coord = {
          x: savedImg.x,
          y: savedImg.y
        };
        this.generate();
      }
    },

    /**
     * redraw image when image attibutes changed of the canvas
     * set photo always fill the full surface of the canvas 
     **/
    generate: function() {
      const width = this.image.width * this.image.scale;
      const height = this.image.height * this.image.scale;
      this.clear();

      this.canvas.ctx.drawImage(
        this.image.file,
        this.coord.x,
        this.coord.y,
        width,
        height
      ); 
    },

    /**
     * 
     * @param {*} scale -scale between 50 and 200
     * 
     **/
    scale: function(scale) {
      this.image.scale = scale;
      this.generate();
    },

    // move image to left
    moveLeft: function() {
      this.coord.x = -10 + this.coord.x;
      this.coord.y = 0 + this.coord.y;
      this.generate();
      this.middleCoord = {
        x: this.coord.x + ((this.image.width * this.image.scale) / 2), 
        y: this.coord.y + ((this.image.height * this.image.scale) / 2)
      };
    },

    // image move to right
    moveRight: function() {
      this.coord.x = 10 + this.coord.x;
      this.coord.y = 0 + this.coord.y;
      this.generate();
      this.middleCoord = {
        x: this.coord.x + ((this.image.width * this.image.scale) / 2), 
        y: this.coord.y + ((this.image.height * this.image.scale) / 2)
      };
    },

    /**
     * image positioning
     * image position using mouse drag point insdie the canvas
     **/
    getMousePosition: function(event) {
      const cElem = this.canvas.element.getBoundingClientRect();
      const mousePosition = {
        x: event.clientX - cElem.left,
        y: event.clientY - cElem.top
      };
      return mousePosition;
    }, 

    dragStart: function(event) {  
      const mousePosition = this.getMousePosition(event);
      this.difference = {
        x: this.coord.x - mousePosition.x,
        y: this.coord.y - mousePosition.y
      };
      this.dragPosition = this.dragPosition.bind(this);
      window.addEventListener("mousemove", this.dragPosition, false);
    },

    dragPosition: function(event) {
      const mousePosition = this.getMousePosition(event);
      this.coord.x = mousePosition.x + this.difference.x;
      this.coord.y = mousePosition.y + this.difference.y;
      this.generate();
      this.centerCoord = {
        x: this.coord.x + ((this.image.width*this.image.scale) / 2), 
        y: this.coord.y + ((this.image.height*this.image.scale) / 2)
      };
    }, 

    // clear canvas data
    clear: function() {
      this.canvas.ctx.clearRect(this.canvas.x, this.canvas.y, this.canvas.width, this.canvas.height);
    }
}
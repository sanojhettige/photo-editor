/**
 * 
 * @param {*} options 
 * 
 **/
import ImageProcessor from './imageProcessor';
import { VALID_FILE_FORMATS } from '../config/constants';

export default function ImageEditor(options) {
  const wrapper        = document.querySelector(options.wrapperSelector);
  const canvas         = document.getElementById('editor-canvas');
  const imgObj         = {};
  const editorCanvas   = {};
  const fileInput      = wrapper.querySelector('.files');
  const file           = fileInput.files[0];
  let editableImage    = null;
  editorCanvas.element = canvas;
  editorCanvas.height  = canvas.height;
  editorCanvas.width   = canvas.width;
  
  if (file.type.match(VALID_FILE_FORMATS)) {
    const reader = new FileReader();
    reader.onloadend = function(e) {
      const img = new Image();
      img.src = reader.result;
      
      img.onload = function() {
        // set original dimentions of the image
        const width = img.naturalWidth; 
        const height = img.naturalHeight;

        imgObj.file     = img;
        imgObj.src      = img.src;
        imgObj.width    = width;
        imgObj.height   = height;
        editableImage = new ImageProcessor(imgObj, editorCanvas, options);
      };
    };
    reader.readAsDataURL(file); 
  } else {
    const message = 'oops... something when wrong, please try again.';
    console.log(message);
    document.querySelector('.files').value = null;
    document.getElementById('action_messages').innerHTML = message;
  }
}
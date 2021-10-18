import '../css/main.scss';
import ImageEditor from './lib/imageEditor';

const AppView = () => {
    document.body.innerHTML = `
    <div class="canvas-wrapper">
		<form action="#" class="form">
                <input class="files" id="fileSelector" type="file" />
        </form>
        <canvas id="editor-canvas" style="margin:auto;border: 1px solid #b8b7b6;" width="1440" height="960"></canvas>
        <div class="toolbar">
            <div class="actions">
                <button class="left">< Move Left</button>
                <button class="submit">Submit</button>
                <button class="import">Import</button>
                <button class="reset">Reset</button>
                <button class="right">Move Right ></button>
            </div>
            <div class="actions">
                <input type="range" name="size" min="50" max="200" class="scale" value="100">
            </div>
        </div>
        <div id="action_messages"></div>
	</div>`;


    window.onload = function() {
        const fileSelector = document.getElementById( "fileSelector" );
        fileSelector.addEventListener('change', function(e) {   
            document.querySelector('.scale').value = 100; 
            new ImageEditor({ wrapperSelector: ".canvas-wrapper" });
        });
    }
}

AppView();
# To run

use Live Preview: Run Server, then go to http://127.0.0.1:3000/src/wspr/whisper-offline/

# !! need the english model - ggml-model-whisper-tiny.en.bin or the quantized version which is smaller -- https://whisper.ggerganov.com/ggml-model-whisper-tiny.en-q5_1.bin

====================
IGNORE EVERYTHING BELOW HERE - TRASH FROM ORIGINAL
Usage instructions:<br>

<ul>
<li>Load a ggml model file (you can obtain one from <a href="https://ggml.ggerganov.com/">here</a>, recommended: <b>tiny</b> or <b>base</b>)</li>
<li>Select audio file to transcribe or record audio from the microphone (sample: <a href="https://whisper.ggerganov.com/jfk.wav">jfk.wav</a>)</li>
<li>Click on the "Transcribe" button to start the transcription</li>
</ul>

        Note that the computation is quite heavy and may take a few seconds to complete.<br>
        The transcription results will be displayed in the text area below.<br><br>
        <b>Important:</b>
        <ul>
            <li>your browser must support WASM SIMD instructions for this to work</li>
            <li>Firefox cannot load files larger than 256 MB - use Chrome instead</li>
        </ul>

        <div id="model">
            Whisper models: <span id="model-whisper-status"></span><br><br>
            <button id="fetch-whisper-tiny-en" onclick="loadWhisper('tiny.en')">tiny.en (75 MB)</button>
            <button id="fetch-whisper-tiny" onclick="loadWhisper('tiny')">tiny (75 MB)</button>
            <button id="fetch-whisper-base-en" onclick="loadWhisper('base.en')">base.en (142 MB)</button>
            <button id="fetch-whisper-base" onclick="loadWhisper('base')">base (142 MB)</button>
            <button id="fetch-whisper-small-en" onclick="loadWhisper('small.en')">small.en (466 MB)</button>
            <button id="fetch-whisper-small" onclick="loadWhisper('small')">small (466 MB)</button>
            <input type="file" id="whisper-file" name="file" onchange="loadFile(event, 'whisper.bin')" />
            <br><br>
            Quantized models:<br><br>
            <button id="fetch-whisper-tiny-en-q5_1" onclick="loadWhisper('tiny-en-q5_1')">tiny.en (Q5_1, 31 MB)</button>
            <button id="fetch-whisper-tiny-q5_1" onclick="loadWhisper('tiny-q5_1')">tiny (Q5_1, 31 MB)</button>
            <button id="fetch-whisper-base-en-q5_1" onclick="loadWhisper('base-en-q5_1')">base.en (Q5_1, 57 MB)</button>
            <button id="fetch-whisper-base-q5_1" onclick="loadWhisper('base-q5_1')">base (Q5_1, 57 MB)</button>
            <button id="fetch-whisper-small-en-q5_1" onclick="loadWhisper('small-en-q5_1')">small.en (Q5_1, 182 MB)</button>
            <button id="fetch-whisper-small-q5_1" onclick="loadWhisper('small-q5_1')">small (Q5_1, 182 MB)</button><br>
            <button id="fetch-whisper-medium-en-q5_0" onclick="loadWhisper('medium-en-q5_0')">medium.en (Q5_0, 515 MB)</button>
            <button id="fetch-whisper-medium-q5_0" onclick="loadWhisper('medium-q5_0')">medium (Q5_0, 515 MB)</button>
            <button id="fetch-whisper-large-q5_0" onclick="loadWhisper('large-q5_0')">large (Q5_0, 1030 MB)</button>

        </div>

const path = "./model.json";
document.addEventListener("DOMContentLoaded", async () => {
  // Load the small speech recognition model
  const model = await tf.loadLayersModel(path); //"path/to/small_model/model.json");

  // Initialize the speech recognition API
  const recognition = new window.webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.lang = "en-US";

  // Handle the recognition result
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    document.getElementById("result").innerText = `Predicted Digit: ${transcript}`;
  };

  // Handle errors during recognition
  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
  };

  // Handle the start button click
  document.getElementById("startButton").addEventListener("click", () => {
    document.getElementById("result").innerText = "";
    recognition.start();
  });
});

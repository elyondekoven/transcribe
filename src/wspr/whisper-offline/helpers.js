// Common Javascript functions used by the examples

// function convertTypedArray(src, type) {
//   var buffer = new ArrayBuffer(src.byteLength);
//   // var baseView = new src.constructor(buffer).set(src);
//   return new type(buffer);
// }
const recBox = document.getElementById("words");
recBox.value = "1, one, 2, two, 3, four";
let results = {};
const dunno = "...waiting...";
const init = () => {
  results = {
    original: dunno,
    parsed: dunno,
    whisper_print_timings: {
      "load time": dunno,
      "encode time": dunno,
      "decode time": dunno,
      "total time": dunno,
    },
  };
};
var updateRecog = (t) => {
  const recogList = recBox.value.split(",").map((v) => v.trim()); //["1", "one", "2", "two", "3"];
  // let original;
  let parsed;
  // console.log(9999111, t);
  // const up = [];
  if (t?.includes("-->")) {
    //} && !t?.includes("BLANK_AUDIO")) {
    let newt = t;
    if (t?.includes("BLANK_AUDIO")) {
      // newt = "[BLANK_AUDIO]";
      parsed = "";
    } else {
      const newnewt = t.split("]")[1].trim();
      const els = newnewt.replace(/\,/g, " ").replace(".", "").split(" ");
      parsed = els.map((l) => (recogList.includes(l + "") ? l : "")).join("");
    }
    if (results.original !== dunno) {
      results.original += "<br>" + newt;
      results.parsed += parsed ? " " + parsed : "";
    } else {
      results.original = newt;
      results.parsed = parsed;
    }
  } else {
    const sp = t ? t.split(":") : ["other", ""];
    const cat = sp[0];
    const cont = sp[1];
    if (!results[cat]) {
      results[cat] = {};
    }
    // if (cont.includes("=")) {
    const fff = cont.split("=");
    // if (!results[cat]) {
    //   results[cat] = {};
    // }
    results[cat][fff[0].trim()] = fff[1]?.trim();
    // } else {
    //   results[cat] = cont;
    // }
  }
  updateResults();
  // e.innerHTML = `<div>original: ${original}</div><div>parsed: ${parsed}</div>`;
};
const updateResults = () => {
  document.getElementById("original").innerHTML = results.original;
  document.getElementById("parsed").innerHTML = results.parsed;
  // document.getElementById("loadTime").innerHTML = results.whisper_print_timings["load time"];
  document.getElementById("encodeTime").innerHTML = results.whisper_print_timings["encode time"];
  document.getElementById("decodeTime").innerHTML = results.whisper_print_timings["decode time"];
  document.getElementById("totalTime").innerHTML = results.whisper_print_timings["total time"];
  // Object.keys(results).forEach((key) => {
  //   // console.log(1112134, key, results[key]);
  //   const e = document.getElementById(key);
  //   if (e) e.innerHTML = JSON.stringify(results[key]);
  //   // else console.log(111, "no: " + key);
  // });
  // document.getElementById("parsed").innerHTML = results.parsed;
  // document.getElementById("original").innerHTML = results.original;
  // document.getElementById("recognized").innerHTML = JSON.stringify(results);
  // document.getElementById("whisper_init_from_file_with_params_no_state").innerHTML = JSON.stringify(
  //   results.whisper_init_from_file_with_params_no_state,
  // );
};

var printTextarea = (function () {
  var element = document.getElementById("output");
  if (element) element.value = ""; // clear browser cache
  return function (text) {
    // console.log(11122, text);
    if (text === null) {
      if (element) element.value = ""; // clear browser cache
    } else {
      if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(" ");
      console.log(text);
      if (element) {
        element.value += text + "\n";
        element.scrollTop = element.scrollHeight; // focus on bottom
      }
    }
    updateRecog(text);
  };
})();

// async function clearCache() {
//   if (confirm("Are you sure you want to clear the cache?\nAll the models will be downloaded again.")) {
//     indexedDB.deleteDatabase(dbName);
//     location.reload();
//   }
// }

// MODEL
async function _fetchRemote(url, cbProgress, cbPrint) {
  cbPrint("fetchRemote: downloading with fetch()...");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/octet-stream",
    },
  });

  if (!response.ok) {
    cbPrint("fetchRemote: failed to fetch " + url);
    return;
  }

  const contentLength = response.headers.get("content-length");
  const total = parseInt(contentLength, 10);
  const reader = response.body.getReader();

  var chunks = [];
  var receivedLength = 0;
  var progressLast = -1;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    chunks.push(value);
    receivedLength += value.length;

    if (contentLength) {
      cbProgress(receivedLength / total);

      var progressCur = Math.round((receivedLength / total) * 10);
      if (progressCur != progressLast) {
        cbPrint("fetchRemote: fetching " + 10 * progressCur + "% ...");
        progressLast = progressCur;
      }
    }
  }

  var position = 0;
  var chunksAll = new Uint8Array(receivedLength);

  for (var chunk of chunks) {
    chunksAll.set(chunk, position);
    position += chunk.length;
  }

  return chunksAll;
}

function loadModel(url, dst, size_mb, cbProgress, cbReady, cbCancel, cbPrint) {
  // if (!navigator.storage || !navigator.storage.estimate) {
  //   cbPrint("loadRemote: navigator.storage.estimate() is not supported");
  // } else {
  // query the storage quota and print it
  // navigator.storage.estimate().then(function (estimate) {
  //   cbPrint("loadRemote: storage quota: " + estimate.quota + " bytes");
  //   cbPrint("loadRemote: storage usage: " + estimate.usage + " bytes");
  // });
  // }

  // check if the data is already in the IndexedDB
  var rq = indexedDB.open(dbName, dbVersion);

  rq.onupgradeneeded = function (event) {
    var db = event.target.result;
    if (db.version == 1) {
      var os = db.createObjectStore("models", { autoIncrement: false });
      cbPrint("loadModel: created IndexedDB " + db.name + " version " + db.version);
    } else {
      // clear the database
      var os = event.currentTarget.transaction.objectStore("models");
      os.clear();
      cbPrint("loadModel: cleared IndexedDB " + db.name + " version " + db.version);
    }
  };

  rq.onsuccess = function (event) {
    var db = event.target.result;
    var tx = db.transaction(["models"], "readonly");
    var os = tx.objectStore("models");
    var rq2 = os.get(url);

    rq2.onsuccess = function (event) {
      if (rq2.result) {
        cbPrint('load remote: "' + url + '" is already in the IndexedDB');
        cbReady(dst, rq2.result);
      } else {
        // data is not in the IndexedDB
        cbPrint('loadModel: "' + url + '" is not in the IndexedDB');

        // alert and ask the user to confirm
        if (
          !confirm(
            "You are about to download " +
              size_mb +
              " MB of data.\n" +
              "The model data will be cached in the browser for future use.\n\n" +
              "Press OK to continue.",
          )
        ) {
          cbCancel();
          return;
        }

        _fetchRemote(url, cbProgress, cbPrint).then(function (data) {
          if (data) {
            // store the data in the IndexedDB
            var rq = indexedDB.open(dbName, dbVersion);
            rq.onsuccess = function (event) {
              var db = event.target.result;
              var tx = db.transaction(["models"], "readwrite");
              var os = tx.objectStore("models");

              var rq = null;
              try {
                var rq = os.put(data, url);
              } catch (e) {
                cbPrint('loadModel: failed to store "' + url + '" in the IndexedDB: \n' + e);
                cbCancel();
                return;
              }

              rq.onsuccess = function (event) {
                cbPrint('loadModel: "' + url + '" stored in the IndexedDB');
                cbReady(dst, data);
              };

              rq.onerror = function (event) {
                cbPrint('loadModel: failed to store "' + url + '" in the IndexedDB');
                cbCancel();
              };
            };
          }
        });
      }
    };

    rq2.onerror = function (event) {
      cbPrint("loadModel: failed to get data from the IndexedDB");
      cbCancel();
    };
  };

  rq.onerror = function (event) {
    cbPrint("loadModel: failed to open IndexedDB");
    cbCancel();
  };

  rq.onblocked = function (event) {
    cbPrint("loadModel: failed to open IndexedDB: blocked");
    cbCancel();
  };

  rq.onabort = function (event) {
    cbPrint("loadModel: failed to open IndexedDB: abort");
    cbCancel();
  };
}

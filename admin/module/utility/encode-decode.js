class EncodeDecode {
  constructor(options) {
    this.handleEvent();
  }
  static instance(options) {
    return new EncodeDecode(options);
  }
  handleEvent() {
    $(".bt-paste").on("click", (e) => {
      navigator.clipboard.readText().then(
        (cliptext) => {
          $("#input-in").val(cliptext);
          UI.info("Clipboard content has been pasted to input.").show();
        },
        (err) => UI.error(err).show()
      );
    });
    $(".bt-clear-input").on("click", (e) => {
      $("#input-in").val("");
    });
    $(".bt-encode").on("click", () => {
      let dataIn = $("#input-in").val();
      let encoded = Core.compress(dataIn.trim());
      $("#input-out").val(encoded);
    });
    $(".bt-decode").on("click", () => {
      let dataIn = $("#input-in").val();
      const result = dataIn.split(/\r?\n/); //.filter(element => element);
      let index = 0,
        percent = 0,
        output = "",
        empty = 0;
      $(".pb-encode-decode").css("width", "0%");
      $(".progress-value").html(`${index}/${result.length} ${percent} %`);
      $("#input-out").val("");
      setTimeout(() => {
        result.forEach((r) => {
          try {
            index++;
            percent = parseInt((index / result.length) * 100) + "%";
            let decoded = Core.decompress(r.trim());
            if (typeof decoded === "object") {
              output +=
                index > 1
                  ? "\n" + JSON.stringify(decoded)
                  : JSON.stringify(decoded);
            } else output += index > 1 ? "\n" + decoded : decoded;
          } catch (e) {
            output += index > 1 ? "\n" + r : r;
            if (!r || /^\s*$/.test(r)) empty++;
            else UI.error(`Invalid input data on line ${index}: ${e}`).show();
          } finally {
            $(".pb-encode-decode").css("width", percent);
            $(".progress-value").html(
              `${index}/${result.length} ${percent}. <small class="text-muted">${empty} empty line(s).</small>`
            );
            $("#input-out").val(output);
          }
        });
      }, 500);
    });
    $(".bt-copy").on("click", (e) => {
      let cliptext = $("#input-out").val();
      navigator.clipboard.writeText(cliptext).then(
        (success) =>
          UI.info("Output content has been copied to clipboard.").show(),
        (err) => UI.error(`Error copying content to clipboard. ${err}`).show()
      );
    });
  }
}

$(() => {
  EncodeDecode.instance();
});

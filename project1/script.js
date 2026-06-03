(function () {
  function byId(id) {
    return document.getElementById(id);
  }

  function randomScore(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function setPreview(fileInput, previewEl, mediaType) {
    if (!fileInput || !previewEl) return;
    fileInput.addEventListener("change", function () {
      const file = fileInput.files && fileInput.files[0];
      if (!file) {
        previewEl.textContent = mediaType === "image" ? "Image preview" : "Video preview";
        return;
      }
      const url = URL.createObjectURL(file);
      if (mediaType === "image") {
        previewEl.innerHTML = '<img alt="image preview" />';
        previewEl.querySelector("img").src = url;
      } else {
        previewEl.innerHTML = '<video controls muted></video>';
        previewEl.querySelector("video").src = url;
      }
    });
  }

  function runAnalysis() {
    const textInput = byId("textInput");
    const imageInput = byId("imageInput");
    const videoInput = byId("videoInput");
    const useTextChoice = byId("useTextChoice");
    const useImageChoice = byId("useImageChoice");
    const useVideoChoice = byId("useVideoChoice");

    const useText = !!(useTextChoice && useTextChoice.checked);
    const useImage = !!(useImageChoice && useImageChoice.checked);
    const useVideo = !!(useVideoChoice && useVideoChoice.checked);

    const text = textInput ? textInput.value.trim() : "";
    const hasTextInput = useText ? text.length > 0 : false;
    const hasImage = imageInput && imageInput.files && imageInput.files.length > 0;
    const hasVideo = videoInput && videoInput.files && videoInput.files.length > 0;

    const hasImageInput = useImage ? hasImage : false;
    const hasVideoInput = useVideo ? hasVideo : false;

    if (!useText && !useImage && !useVideo) {
      alert("Please select at least one modality (Text, Image, or Video).");
      return;
    }

    if (useText && !hasTextInput) {
      alert("Text Analysis is selected, but text input is empty.");
      return;
    }
    if (useImage && !hasImageInput) {
      alert("Image Analysis is selected, but no image is uploaded.");
      return;
    }
    if (useVideo && !hasVideoInput) {
      alert("Video Analysis is selected, but no video is uploaded.");
      return;
    }

    // Generate mock scores only for selected modalities.
    const weights = { text: 0.3, image: 0.35, video: 0.35 };
    let weightSum = 0;
    if (useText) weightSum += weights.text;
    if (useImage) weightSum += weights.image;
    if (useVideo) weightSum += weights.video;

    const textScore = useText ? randomScore(70, 95) : null;
    const imageScore = useImage ? randomScore(72, 97) : null;
    const videoScore = useVideo ? randomScore(68, 96) : null;

    const overall =
      Math.round(
        ((textScore ?? 0) * (useText ? weights.text / weightSum : 0)) +
          ((imageScore ?? 0) * (useImage ? weights.image / weightSum : 0)) +
          ((videoScore ?? 0) * (useVideo ? weights.video / weightSum : 0))
      ) || 0;

    const verdict = overall >= 65 ? "FAKE" : "REAL";

    const keywords = useText
      ? text
          .split(/\s+/)
          .filter(function (word) {
            return word.length > 5;
          })
          .slice(0, 4)
      : [];

    const result = {
      verdict: verdict,
      overall: overall,
      inputs: {
        hasText: !!hasTextInput,
        hasImage: !!hasImageInput,
        hasVideo: !!hasVideoInput
      },
      scores: {
        text: textScore,
        image: imageScore,
        video: videoScore
      },
      keywords: keywords,
      selectedModalities: {
        useText: useText,
        useImage: useImage,
        useVideo: useVideo
      },
      createdAt: new Date().toLocaleString()
    };

    localStorage.setItem("deepfake_result", JSON.stringify(result));
    window.location.href = "dashboard.html";
  }

  function clearAnalysisForm() {
    const textInput = byId("textInput");
    const imageInput = byId("imageInput");
    const videoInput = byId("videoInput");
    const imagePreview = byId("imagePreview");
    const videoPreview = byId("videoPreview");

    if (textInput) textInput.value = "";
    if (imageInput) imageInput.value = "";
    if (videoInput) videoInput.value = "";
    if (imagePreview) imagePreview.textContent = "Image preview";
    if (videoPreview) videoPreview.textContent = "Video preview";
  }

  function loadDashboard() {
    const raw = localStorage.getItem("deepfake_result");
    if (!raw) return;

    let result;
    try {
      result = JSON.parse(raw);
    } catch (err) {
      return;
    }

    const verdictEl = byId("overallVerdict");
    const confidenceEl = byId("overallConfidence");
    const textLabel = byId("textScoreLabel");
    const imageLabel = byId("imageScoreLabel");
    const videoLabel = byId("videoScoreLabel");
    const textBar = byId("textBar");
    const imageBar = byId("imageBar");
    const videoBar = byId("videoBar");
    const insightsList = byId("insightsList");

    const metricText = byId("metricText");
    const metricImage = byId("metricImage");
    const metricVideo = byId("metricVideo");

    // Backward compatibility: support old schema (textScore/imageScore/videoScore).
    const inputs = result.inputs || {
      hasText: typeof result.textScore === "number",
      hasImage: typeof result.imageScore === "number",
      hasVideo: typeof result.videoScore === "number"
    };
    const scores = result.scores || {
      text: result.textScore,
      image: result.imageScore,
      video: result.videoScore
    };

    if (verdictEl) {
      verdictEl.textContent = result.verdict;
      verdictEl.classList.remove("fake", "real");
      verdictEl.classList.add(result.verdict === "FAKE" ? "fake" : "real");
    }
    if (confidenceEl) confidenceEl.textContent = "Confidence: " + result.overall + "%";

    // Show/hide metrics based on selected modalities.
    if (metricText) metricText.style.display = inputs.hasText ? "" : "none";
    if (metricImage) metricImage.style.display = inputs.hasImage ? "" : "none";
    if (metricVideo) metricVideo.style.display = inputs.hasVideo ? "" : "none";

    if (textLabel && inputs.hasText) textLabel.textContent = scores.text + "%";
    if (imageLabel && inputs.hasImage) imageLabel.textContent = scores.image + "%";
    if (videoLabel && inputs.hasVideo) videoLabel.textContent = scores.video + "%";

    if (textBar && inputs.hasText) textBar.style.width = scores.text + "%";
    if (imageBar && inputs.hasImage) imageBar.style.width = scores.image + "%";
    if (videoBar && inputs.hasVideo) videoBar.style.width = scores.video + "%";

    if (insightsList) {
      const li = [];

      if (inputs.hasText) {
        const words =
          result.keywords && result.keywords.length ? result.keywords.join(", ") : "none";
        li.push("Detected high-risk text pattern keywords: " + words + ".");
      }
      if (inputs.hasImage) {
        li.push("Image modality confidence indicates probable manipulation traces.");
      }
      if (inputs.hasVideo) {
        li.push("Video modality confidence indicates temporal inconsistency signals.");
      }

      li.push("Last analysis time: " + result.createdAt + ".");
      insightsList.innerHTML = li.map(function (t) {
        return "<li>" + t + "</li>";
      }).join("");
    }
  }

  function downloadReport() {
    const raw = localStorage.getItem("deepfake_result");
    if (!raw) {
      alert("No result found. Run analysis first.");
      return;
    }
    const result = JSON.parse(raw);

    // Backward compatibility: support old schema.
    const inputs = result.inputs || {
      hasText: typeof result.textScore === "number",
      hasImage: typeof result.imageScore === "number",
      hasVideo: typeof result.videoScore === "number"
    };
    const scores = result.scores || {
      text: result.textScore,
      image: result.imageScore,
      video: result.videoScore
    };

    const lines = [
      "Multi-Modal Deepfake Detection Report",
      "-----------------------------------",
      "Verdict: " + result.verdict,
      "Overall Confidence: " + result.overall + "%",
      "Text Score: " + (inputs.hasText ? scores.text + "%" : "N/A"),
      "Image Score: " + (inputs.hasImage ? scores.image + "%" : "N/A"),
      "Video Score: " + (inputs.hasVideo ? scores.video + "%" : "N/A"),
      "Keywords: " +
        (result.keywords && result.keywords.length ? result.keywords.join(", ") : "none"),
      "Generated At: " + result.createdAt
    ];

    const report = lines.join("\n");

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "deepfake-report.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  document.addEventListener("DOMContentLoaded", function () {
    setPreview(byId("imageInput"), byId("imagePreview"), "image");
    setPreview(byId("videoInput"), byId("videoPreview"), "video");

    const runBtn = byId("runAnalysisBtn");
    const clearBtn = byId("clearBtn");
    const downloadBtn = byId("downloadBtn");

    function applyChoiceState() {
      const useTextChoice = byId("useTextChoice");
      const useImageChoice = byId("useImageChoice");
      const useVideoChoice = byId("useVideoChoice");
      const textInput = byId("textInput");
      const imageInput = byId("imageInput");
      const videoInput = byId("videoInput");
      const imagePreview = byId("imagePreview");
      const videoPreview = byId("videoPreview");

      const useText = !!(useTextChoice && useTextChoice.checked);
      const useImage = !!(useImageChoice && useImageChoice.checked);
      const useVideo = !!(useVideoChoice && useVideoChoice.checked);

      if (textInput) textInput.disabled = !useText;
      if (imageInput) imageInput.disabled = !useImage;
      if (videoInput) videoInput.disabled = !useVideo;

      if (imagePreview) {
        if (!useImage) imagePreview.textContent = "Image preview";
      }
      if (videoPreview) {
        if (!useVideo) videoPreview.textContent = "Video preview";
      }
    }

    if (runBtn) runBtn.addEventListener("click", runAnalysis);
    if (clearBtn) clearBtn.addEventListener("click", clearAnalysisForm);
    if (downloadBtn) downloadBtn.addEventListener("click", downloadReport);

    const useTextChoice = byId("useTextChoice");
    const useImageChoice = byId("useImageChoice");
    const useVideoChoice = byId("useVideoChoice");
    if (useTextChoice) useTextChoice.addEventListener("change", applyChoiceState);
    if (useImageChoice) useImageChoice.addEventListener("change", applyChoiceState);
    if (useVideoChoice) useVideoChoice.addEventListener("change", applyChoiceState);
    applyChoiceState();

    loadDashboard();
  });
})();

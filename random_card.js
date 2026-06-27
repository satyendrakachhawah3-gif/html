const cardElement = document.getElementById('cardElement');
const cardImage = document.getElementById('cardImage');
const cardText = document.getElementById('cardText');
const refreshBtn = document.getElementById('refreshBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Function to fetch random content
async function fetchRandomContent() {
  cardElement.classList.add('loading');
  refreshBtn.disabled = true;
  downloadBtn.disabled = true;
  
  try {
    // Generate a random seed for the image to avoid browser caching
    const randomSeed = Math.floor(Math.random() * 10000);
    // Using Picsum photos with the seed parameter ensures a random image
    //Here i use api for genertate random image in
    const imageUrl = `https://picsum.photos/seed/${randomSeed}/400/300`;
    
    // Fetch Lorem Ipsum text
    // This is the random text generator api
    const textResponse = await fetch('https://baconipsum.com/api/?type=meat-and-filler&sentences=2');
    const textData = await textResponse.json();
    
    // Wait for image to load to remove loader smoothly
    await new Promise((resolve, reject) => {
      cardImage.onload = resolve;
      cardImage.onerror = reject;
      cardImage.src = imageUrl;
    });

    // Set the text
    if (textData && textData.length > 0) {
      cardText.textContent = textData[0];
    }

  } catch (error) {
    console.error("Error fetching content:", error);
    // Fallback dummy text if the API fails
    cardText.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
  } finally {
    cardElement.classList.remove('loading');
    refreshBtn.disabled = false;
    downloadBtn.disabled = false;
  }
}

// Function to download the card
function downloadCard() {
  const originalText = downloadBtn.innerHTML;
  downloadBtn.innerHTML = "Downloading...";
  downloadBtn.disabled = true;

  // Add a slight delay to ensure visual state is clean
  setTimeout(() => {
    html2canvas(cardElement, {
      scale: 2, // Higher quality
      useCORS: true, // Allow cross-origin images to be rendered on the canvas
      backgroundColor: null 
    }).then(canvas => {
      // Convert the canvas to a data URL and trigger download
      const link = document.createElement('a');
      link.download = `random-card-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }).catch(err => {
      console.error("Error capturing card:", err);
      alert("Failed to download the image. Please try again.");
    }).finally(() => {
      // Restore button state
      downloadBtn.innerHTML = originalText;
      downloadBtn.disabled = false;
    });
  }, 100);
}

// Event Listeners
refreshBtn.addEventListener('click', fetchRandomContent);
downloadBtn.addEventListener('click', downloadCard);

// Initial load
fetchRandomContent();

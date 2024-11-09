// Function to translate text using the LibreTranslate API with a CORS proxy
async function translateText(text, targetLang = 'es') {
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const apiUrl = 'https://libretranslate.com/translate';
    
    const response = await fetch(proxyUrl + apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            q: text,
            source: 'en',
            target: targetLang,
            format: 'text'
        })
    });
    const data = await response.json();
    return data.translatedText;
}

// Function to translate all displayed event text on the page
async function translateAllText() {
    const elementsToTranslate = document.querySelectorAll('.event *');
    console.log("Starting translation for", elementsToTranslate.length, "elements.");

    for (let element of elementsToTranslate) {
        const originalText = element.innerText;
        if (originalText.trim()) {
            try {
                const translatedText = await translateText(originalText);
                console.log(`Translated "${originalText}" to "${translatedText}"`);
                element.innerText = translatedText;
            } catch (error) {
                console.error("Translation error:", error);
            }
        }
    }

    console.log("Translation complete.");
}

// Event listener for the translate button
document.getElementById('translateButton').addEventListener('click', translateAllText);

// Tablica kluczy wczytanych z pliku JSON
const klucze = [];
let currentBlockIndex = 0;   // numer aktualnego bloku
let currentIndex = 0;        // indeks obrazu w bloku (0-9)

// Cache obrazków w aktualnym bloku
const imagesCache = [];
const blockSize = 10; // liczba obrazów w jednym bloku

// Funkcja do wczytania listy kluczy z pliku JSON
fetch('./zmodyfikowany_plik.json')
  .then(res => res.json())
  .then(data => {
    Object.keys(data).forEach(k => klucze.push(k));
    if (klucze.length > 0) {
      loadBlock(currentBlockIndex);
    }
  })
  .catch(err => console.error('Błąd wczytania kluczy:', err));

// Funkcja do ładowania obrazów w bloku
async function loadBlock(blockIdx) {
  imagesCache.length = 0; // wyczyść cache
  const start = blockIdx * blockSize;
  const end = Math.min(start + blockSize, klucze.length);
  const promises = [];

  for (let i = start; i < end; i++) {
    promises.push(
      fetch('http://localhost:3000/get-manifest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ klucz: klucze[i] }),
      }).then(res => res.json())
        .then(data => ({
          label: data.label || 'Brak etykiety',
          imageBase64: data.imageBase64,
          imageType: data.imageType
        }))
    );
  }
  const results = await Promise.all(promises);
  results.forEach(r => imagesCache.push(r));

  // Po załadowaniu, wyświetl pierwszy obraz z nowego bloku
  currentIndex = 0;
  if (imagesCache.length > 0) {
    displayImage(currentIndex);
  }
}

// Funkcja do wyświetlenia obrazu i etykiety
function displayImage(indexInBlock) {
  const data = imagesCache[indexInBlock];
  if (data) {
    document.getElementById('labelContainer').innerText = data.label;
    document.getElementById('dynamicImage').src = `data:${data.imageType};base64,${data.imageBase64}`;
  }
}

// Obsługa przycisków
document.getElementById("prevBtn").addEventListener("click", () => {
  if (current => {
    if (currentIndex > 0) {
      currentIndex--;
      // Jeśli w cache jest obraz po lewej, wyświetl go natychmiast
      if (currentIndex === 0 && currentBlockIndex > 0) {
        // Wczytaj poprzedni blok i ustaw obraz na ostatni
        currentBlockIndex--;
        loadBlock(currentBlockIndex).then(() => {
          currentIndex = imagesCache.length - 1;
          displayImage(currentIndex);
        });
      } else {
        displayImage(currentIndex);
      }
    }
  });
});

document.getElementById("nextBtn").addEventListener("click", () => {
  if (current => {
    if (currentIndex < klucze.length - 1) {
      currentIndex++;
      if (currentIndex % blockSize === 0) {
        // jeśli przeszedłeś do nowego bloku
        currentBlockIndex++;
        loadBlock(currentBlockIndex).then(() => {
          currentIndex = 0;
          displayImage(currentIndex);
        });
      } else {
        displayImage(currentIndex);
      }
    }
  });
});
































// wersja nr 2 

// let klucze = [];
// let currentIndex = 0;

// // Cache obrazków wokół
// const previews = {
// 	left: null,
// 	right: null,
// };

// // Wczytanie kluczy z pliku JSON
// fetch("./zmodyfikowany_plik.json")
// 	.then((res) => res.json())
// 	.then((data) => {
// 		klucze = Object.keys(data);
// 		if (klucze.length > 0) {
// 			loadImage(currentIndex);
// 		}
// 	})
// 	.catch((err) => console.error("Błąd wczytania kluczy:", err));

// // Funkcja do pobrania informacji o obrazie i etykietę
// function loadImage(index) {
// 	const klucz = klucze[index];

// 	fetch("http://localhost:3000/get-manifest", {
// 		method: "POST",
// 		headers: { "Content-Type": "application/json" },
// 		body: JSON.stringify({ klucz }),
// 	})
// 		.then((res) => res.json())
// 		.then((data) => {
// 			// Wyświetlamy etykietę
// 			document.getElementById("labelContainer").innerText =
// 				data.label || "Brak etykiety";

// 			// Wyświetlamy obraz jako data URL
// 			document.getElementById(
// 				"dynamicImage"
// 			).src = `data:${data.imageType};base64,${data.imageBase64}`;

// 			// Ustawiamy indeks
// 			currentIndex = index;

// 			// Czyścimy cache na obrazki wokół
// 			previews.left = null;
// 			previews.right = null;

// 			// Prefetch obrazków wokół
// 			prefetchImages();
// 		})
// 		.catch((err) => {
// 			console.error("Błąd wczytania obrazu:", err);
// 		});
// }

// // Funkcja do prefetchowania obrazków wokół aktualnego
// async function prefetchImages() {
// 	if (currentIndex > 0 && !previews.left) {
// 		const blobLeft = await fetchImageByIndex(currentIndex - 1);
// 		previews.left = URL.createObjectURL(blobLeft);
// 	}
// 	if (currentIndex < klucze.length - 1 && !previews.right) {
// 		const blobRight = await fetchImageByIndex(currentIndex + 1);
// 		previews.right = URL.createObjectURL(blobRight);
// 	}
// }

// // Funkcja do pobrania obrazu po indeksie
// function fetchImageByIndex(index) {
// 	const klucz = klucze[index];
// 	return fetch("/get-manifest", {
// 		method: "POST",
// 		headers: { "Content-Type": "application/json" },
// 		body: JSON.stringify({ klucz }),
// 	}).then((res) => res.blob());
// }

// // Обработка кнопок
// document.getElementById("prevBtn").addEventListener("click", () => {
// 	if (currentIndex > 0) {
// 		if (previews.left) {
// 			// Używamy wstępnie załadowanego
// 			document.getElementById("dynamicImage").src = previews.left;
// 			currentIndex--;
// 			// Odśwież cache obrazków wokół
// 			previews.left = null;
// 			previews.right = null;
// 			prefetchImages();
// 		} else {
// 			// Jeśli brak w cache, ładujemy normalnie
// 			currentIndex--;
// 			loadImage(currentIndex);
// 		}
// 	}
// });

// document.getElementById("nextBtn").addEventListener("click", () => {
// 	if (currentIndex < klucze.length - 1) {
// 		if (previews.right) {
// 			document.getElementById("dynamicImage").src = previews.right;
// 			currentIndex++;
// 			previews.left = null;
// 			previews.right = null;
// 			prefetchImages();
// 		} else {
// 			currentIndex++;
// 			loadImage(currentIndex);
// 		}
// 	}
// });

// let klucze = [];
// let currentIndex = 0;

// // Obiekty do przechowywania cache'owanych obrazków
// const previews = {
// 	left: null,
// 	right: null,
// };

// // Funkcja do wczytania pliku JSON z kluczami
// fetch("./zmodyfikowany_plik.json")
// 	.then((res) => res.json())
// 	.then((data) => {
// 		klucze = Object.keys(data);
// 		if (klucze.length > 0) {
// 			// Załaduj pierwszy obraz
// 			loadImage(currentIndex);
// 		}
// 	})
// 	.catch((err) => console.error("Błąd wczytania kluczy:", err));

// // Funkcja do pobrania i cache'owania obrazów dookoła
// async function prefetchImages() {
// 	// Wstępnie ładuje obrazek po lewej
// 	if (currentIndex > 0 && !previews.left) {
// 		const blobLeft = await fetchImageByIndex(currentIndex - 1);
// 		previews.left = URL.createObjectURL(blobLeft);
// 	}
// 	// Wstępnie ładuje obrazek po prawej
// 	if (currentIndex < klucze.length - 1 && !previews.right) {
// 		const blobRight = await fetchImageByIndex(currentIndex + 1);
// 		previews.right = URL.createObjectURL(blobRight);
// 	}
// }

// // Funkcja do pobrania obrazu po indeksie (z cache'owania)
// function fetchImageByIndex(index) {
// 	const klucz = klucze[index];
// 	return fetch("http://localhost:3000/get-manifest", {
// 		method: "POST",
// 		headers: { "Content-Type": "application/json" },
// 		body: JSON.stringify({ klucz }),
// 	}).then((res) => res.blob());
// }

// // Funkcja do załadowania i wyświetlania aktualnego obrazu
// function loadImage(index) {
// 	const klucz = klucze[index];

// 	fetch("http://localhost:3000/get-manifest", {
// 		method: "POST",
// 		headers: { "Content-Type": "application/json" },
// 		body: JSON.stringify({ klucz }),
// 	})
// 		.then((res) => res.blob())
// 		.then((blob) => {
// 			document.getElementById("dynamicImage").src = URL.createObjectURL(blob);
// 			currentIndex = index;
// 			// Przy ładowaniu nowego obrazu usuwamy poprzedni cache do obrazków do przodu i do tyłu
// 			previews.left = null;
// 			previews.right = null;
// 			// Wstępnie ładujemy obrazki wokół nowego
// 			prefetchImages();
// 		})
// 		.catch((err) => {
// 			console.error("Błąd wczytania obrazka:", err);
// 		});
// }

// // Przycisk Lewo
// document.getElementById("prevBtn").addEventListener("click", () => {
// 	if (currentIndex > 0) {
// 		if (previews.left) {
// 			// Używamy już wstępnie załadowanego obrazu
// 			document.getElementById("dynamicImage").src = previews.left;
// 			currentIndex--;
// 			// Preload kolejnego obrazka wokół nowego indeksu
// 			previews.left = null;
// 			previews.right = null;
// 			prefetchImages();
// 		} else {
// 			// Jeśli nie ma w cache, ładujemy normalnie
// 			currentIndex--;
// 			loadImage(currentIndex);
// 		}
// 	}
// });

// // Przycisk Prawo
// document.getElementById("nextBtn").addEventListener("click", () => {
// 	if (currentIndex < klucze.length - 1) {
// 		if (previews.right) {
// 			document.getElementById("dynamicImage").src = previews.right;
// 			currentIndex++;
// 			previews.left = null;
// 			previews.right = null;
// 			prefetchImages();
// 		} else {
// 			currentIndex++;
// 			loadImage(currentIndex);
// 		}
// 	}
// });

// let klucze = [];
// let currentIndex = 0;

// // Obiekty do przechowywania wstępnie załadowanych obrazów
// const previews = {
// 	left: null,
// 	right: null,
// };

// // Funkcja do ładowania pliku JSON z kluczami
// fetch("./zmodyfikowany_plik.json") // ścieżka do pliku z kluczami
// 	.then((res) => res.json())
// 	.then((data) => {
// 		klucze = Object.keys(data);
// 		if (klucze.length > 0) {
// 			loadImage(currentIndex); // wczytaj pierwszy obraz
// 		}
// 	})
// 	.catch((err) => console.error("Błąd wczytania kluczy:", err));

// // Funkcja do wstępnego pobrania obrazków wokół aktualnego
// function prefetchImages() {
// 	// Obrazek po lewej
// 	if (currentIndex > 0 && !previews.left) {
// 		fetchImageByIndex(currentIndex - 1).then((blob) => {
// 			previews.left = URL.createObjectURL(blob);
// 		});
// 	}
// 	// Obrazek po prawej
// 	if (currentIndex < klucze.length - 1 && !previews.right) {
// 		fetchImageByIndex(currentIndex + 1).then((blob) => {
// 			previews.right = URL.createObjectURL(blob);
// 		});
// 	}
// }

// // Funkcja do pobrania obrazu z danego indeksu
// function fetchImageByIndex(index) {
// 	const klucz = klucze[index];
// 	return fetch("http://localhost:3000/get-manifest", {
// 		method: "POST",
// 		headers: { "Content-Type": "application/json" },
// 		body: JSON.stringify({ klucz }),
// 	}).then((res) => res.blob());
// }

// // Funkcja do ładowania obrazu na ekran
// function loadImage(index) {
// 	const klucz = klucze[index];

// 	fetch("http://localhost:3000/get-manifest", {
// 		method: "POST",
// 		headers: { "Content-Type": "application/json" },
// 		body: JSON.stringify({ klucz }), // wysyłamy klucz
// 	})
// 		.then((res) => res.blob())
// 		.then((blob) => {
// 			document.getElementById("dynamicImage").src = URL.createObjectURL(blob);
// 			// Po załadowaniu obrazu, przygotuj obrazki wokół
// 			currentIndex = index;
// 			previews.left = null;
// 			previews.right = null;
// 			prefetchImages();
// 		})
// 		.catch((err) => {
// 			console.error("Błąd wczytywania obrazka:", err);
// 		});
// }

// // Obsługa guziczków nawigacji
// document.getElementById("prevBtn").addEventListener("click", () => {
// 	if (currentIndex > 0) {
// 		if (previews.left) {
// 			// Wysyłamy od razu z cache
// 			document.getElementById("dynamicImage").src = previews.left;
// 			currentIndex--;
// 			// Przygotuj nowe obrazki wokół nowego indeksu
// 			previews.left = null;
// 			previews.right = null;
// 			prefetchImages();
// 		} else {
// 			currentIndex--;
// 			loadImage(currentIndex);
// 		}
// 	}
// });

// document.getElementById("nextBtn").addEventListener("click", () => {
// 	if (currentIndex < klucze.length - 1) {
// 		if (previews.right) {
// 			document.getElementById("dynamicImage").src = previews.right;
// 			currentIndex++;
// 			previews.left = null;
// 			previews.right = null;
// 			prefetchImages();
// 		} else {
// 			currentIndex++;
// 			loadImage(currentIndex);
// 		}
// 	}
// });

// // Na starcie załaduj pierwszy obraz i przygotuj okoliczne
// // (ta funkcja jest wywoływana po załadowaniu pliku JSON powyżej)
// if (klucze.length > 0) {
// 	loadImage(currentIndex);
// }

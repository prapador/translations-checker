
const baseLanguage = "es-ES";
const missingKeys = [];
const sameValueAsSpanish = [];
const exceptions = ["esta key no se tendrá en cuenta en el proceso"];
let showSpanishValue = false; // Flag para mostrar o no el valor en español



function updateDOMWithTranslations() {
  const missingTranslationsBody = document.getElementById('missingTranslations');
  const sameAsSpanishTranslationsBody = document.getElementById('sameAsSpanishTranslations');
  missingTranslationsBody.innerHTML = ''; // Limpiar el contenido existente
  sameAsSpanishTranslationsBody.innerHTML = ''; // Limpiar el contenido existente

  missingKeys.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${item.Language}</td><td>${item.MissingKey}</td>` + 
                      (showSpanishValue ? `<td>${item.SpanishValue || ''}</td>` : '');
      missingTranslationsBody.appendChild(row);
  });

  sameValueAsSpanish.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${item.Language}</td><td>${item.Key}</td>` + 
                      (showSpanishValue ? `<td>${item.Value}</td>` : '');
      sameAsSpanishTranslationsBody.appendChild(row);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  // Recuperar los datos del textarea desde sessionStorage al cargar la página
  const translationsInput = document.getElementById('translationsInput');
  const savedInput = sessionStorage.getItem('translationsInput');
  if (savedInput) {
      translationsInput.value = savedInput;
  }

  // Asignar el evento click al botón para procesar las traducciones
  document.getElementById('processTranslationsButton').addEventListener('click', processTranslations);
});

function processTranslations() {
  const input = document.getElementById('translationsInput').value;
  try {
      const locales = JSON.parse(input);
      missingKeys.length = 0; // Limpia el array antes de volver a llenarlo
      sameValueAsSpanish.length = 0; // Limpia el array antes de volver a llenarlo

      Object.keys(locales).forEach(language => {
          if (language !== baseLanguage) {
              Object.keys(locales[baseLanguage]).forEach(key => {
                  if (!locales[language][key]) {
                      const missingKeyEntry = { Language: language, MissingKey: key, SpanishValue: locales[baseLanguage][key] || '' };
                      missingKeys.push(missingKeyEntry);
                  } else if (locales[language][key] === locales[baseLanguage][key] && !exceptions.includes(key)) {
                      sameValueAsSpanish.push({ Language: language, Key: key, Value: locales[language][key] });
                  }
              });
          }
      });

      updateDOMWithTranslations();

      // Guardar el valor actual del textarea en sessionStorage
      sessionStorage.setItem('translationsInput', input);
  } catch (e) {
      console.error("Error al procesar las traducciones: ", e);
      alert("Hubo un error al procesar las traducciones. Asegúrate de que el formato sea JSON válido.");
  }
}

function generateOutputJSON() {
  const output = {};

  missingKeys.forEach(({ Language, MissingKey, SpanishValue }) => {
    if (!output[Language]) {
      output[Language] = {};
    }
    output[Language][MissingKey] = SpanishValue;
  });

  sameValueAsSpanish.forEach(({ Language, Key, Value }) => {
    if (!output[Language]) {
      output[Language] = {};
    }
    if (!exceptions.includes(Key)) {
      output[Language][Key] = Value;
    }
  });

  const outputJSON = JSON.stringify(output, null, 2); 
  document.getElementById('outputJSON').textContent = outputJSON; 
}

// Añadir un listener al botón de generar JSON de salida
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('generateOutputButton').addEventListener('click', generateOutputJSON);
});

document.addEventListener('DOMContentLoaded', function() {
  // Resto del código existente...

  // Event listener para el switch
  document.getElementById('showSpanishSwitch').addEventListener('change', function() {
      showSpanishValue = this.checked;
      updateDOMWithTranslations(); // Actualizar el DOM con el nuevo valor
  });
});

document.addEventListener('DOMContentLoaded', function() {
  // Cargar excepciones de sessionStorage
  const savedExceptions = JSON.parse(sessionStorage.getItem('exceptions') || '[]');
  exceptions.push(...savedExceptions);
  updateExceptionsList();

  document.getElementById('addExceptionButton').addEventListener('click', addException);
});

function addException() {
  const exceptionInput = document.getElementById('exceptionInput');
  const newException = exceptionInput.value.trim();
  if (newException && !exceptions.includes(newException)) {
    exceptions.push(newException);
    sessionStorage.setItem('exceptions', JSON.stringify(exceptions));
    updateExceptionsList();
    exceptionInput.value = ''; // Limpiar el input
    processTranslations(); // Procesar las traducciones de nuevo
  }
}



// El resto de tu código...

function updateExceptionsList() {
  const exceptionsList = document.getElementById('exceptionsList');
  exceptionsList.innerHTML = ''; // Limpiar lista actual

  exceptions.forEach((exception, index) => {
    const li = document.createElement('li');
    li.textContent = exception;
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Eliminar';
    removeButton.onclick = function() {
      removeException(index);
    };
    li.appendChild(removeButton);
    exceptionsList.appendChild(li);
  });
}

function removeException(index) {
  exceptions.splice(index, 1); // Eliminar la excepción
  sessionStorage.setItem('exceptions', JSON.stringify(exceptions)); // Actualizar sessionStorage
  updateExceptionsList(); // Actualizar la lista en el DOM
}

import { showError } from '../ui/toast.js';
import { isImageUrl } from '../utils/media.js';

let currentPoint = null;
let saveHandler = null;
let backupPoint = null;
let escHandler = null;
let isSaving = false;
let previewObjectUrl = null;

function ensureModal() {
  let modal = document.getElementById('editPointModal');

  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'editPointModal';
  modal.className = 'modal-overlay';

  modal.innerHTML = `
    <div class="modal-card">
      <h2>Editar punto</h2>
      <form id="editPointForm" class="modal-form" novalidate>
        <label for="editTipo">Tipo <span class="field-required">*</span></label>
        <select id="editTipo" name="tipo" required>
          <option value="bardas">Bardas</option>
          <option value="lonas">Lonas</option>
          <option value="espectaculares">Espectaculares</option>
          <option value="vehiculos">Vehículos</option>
          <option value="comites">Comités</option>
          <option value="casillas">Casillas</option>
        </select>

        <label for="editDistrito">Distrito <span class="field-required">*</span></label>
        <input id="editDistrito" name="distrito" type="text" required>

        <label for="editSeccion">Sección</label>
        <input id="editSeccion" name="seccion" type="text">

        <label for="editEncargado">Encargado</label>
        <input id="editEncargado" name="encargado" type="text">

        <label for="editCalle">Calle</label>
        <input id="editCalle" name="calle" type="text">

        <label for="editColonia">Colonia</label>
        <input id="editColonia" name="colonia" type="text">

        <label for="editMunicipio">Municipio</label>
        <input id="editMunicipio" name="municipio" type="text">

        <label for="editUrl">URL de imagen</label>
        <input id="editUrl" name="url" type="text" placeholder="https://...">
        <label for="editImageFile">Imagen</label>
        <input id="editImageFile" name="image" type="file" accept="image/*">
        <div id="editImagePreview" class="edit-image-preview">Sin imagen</div>

        <div class="modal-actions">
          <button type="button" class="btn-secondary-outline" data-close-edit>Cancelar</button>
          <button type="submit" class="btn-primary" id="editSubmitBtn">Guardar cambios</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  escHandler = (event) => {
    if (event.key === 'Escape' && modal.classList.contains('open')) {
      restoreBackup();
      closeEditPointModal();
    }
  };
  document.addEventListener('keydown', escHandler);

  return modal;
}

function setValue(id, value) {
  const input = document.getElementById(id);
  if (input) input.value = value ?? '';
}

function setImagePreview(value) {
  const preview = document.getElementById('editImagePreview');
  if (!preview) return;

  preview.innerHTML = '';

  if (!isImageUrl(value)) {
    preview.textContent = 'Sin imagen';
    preview.className = 'edit-image-preview empty';
    return;
  }

  const image = document.createElement('img');
  image.src = value;
  image.alt = 'Imagen actual del punto';
  image.className = 'edit-image-thumbnail';
  preview.className = 'edit-image-preview';
  preview.appendChild(image);
}

function revokePreviewObjectUrl() {
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
  }
}

function setFilePreview(file) {
  if (!file) {
    return;
  }

  revokePreviewObjectUrl();
  previewObjectUrl = URL.createObjectURL(file);

  const preview = document.getElementById('editImagePreview');
  if (!preview) return;

  preview.innerHTML = '';

  const image = document.createElement('img');
  image.src = previewObjectUrl;
  image.alt = 'Nueva imagen del punto';
  image.className = 'edit-image-thumbnail';
  preview.className = 'edit-image-preview';
  preview.appendChild(image);
}

function setSaving(isSaving) {
  const form = document.getElementById('editPointForm');
  const submit = document.getElementById('editSubmitBtn');

  form?.querySelectorAll('input, select, button').forEach(element => {
    element.disabled = isSaving;
  });

  if (submit) {
    submit.disabled = isSaving;
    submit.textContent = isSaving ? 'Guardando...' : 'Guardar cambios';
  }
}

function validateForm() {
  const tipo = document.getElementById('editTipo')?.value;
  if (!tipo) {
    showError('Debes seleccionar un tipo de punto');
    document.getElementById('editTipo')?.focus();
    return false;
  }

  const distrito = document.getElementById('editDistrito')?.value.trim();
  if (!distrito) {
    showError('El distrito es obligatorio');
    document.getElementById('editDistrito')?.focus();
    return false;
  }

  return true;
}

function restoreBackup() {
  if (!backupPoint) return;
  setValue('editTipo', backupPoint.tipo);
  setValue('editDistrito', backupPoint.distrito);
  setValue('editSeccion', backupPoint.seccion);
  setValue('editEncargado', backupPoint.encargado);
  setValue('editCalle', backupPoint.calle);
  setValue('editColonia', backupPoint.colonia);
  setValue('editMunicipio', backupPoint.municipio);
  setValue('editUrl', backupPoint.url);
  setValue('editImageFile', '');
  setImagePreview(backupPoint.url);
  backupPoint = null;
}

function createUpdatePayload(form) {
  const formData = new FormData(form);
  const image = form.querySelector('#editImageFile')?.files[0];
  const payload = {
    tipo: formData.get('tipo'),
    distrito: formData.get('distrito'),
    seccion: formData.get('seccion'),
    encargado: formData.get('encargado'),
    calle: formData.get('calle'),
    colonia: formData.get('colonia'),
    municipio: formData.get('municipio'),
    url: formData.get('url')
  };

  if (!image) {
    return payload;
  }

  const multipartPayload = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    multipartPayload.append(key, value ?? '');
  });

  multipartPayload.append('image', image);

  return multipartPayload;
}

export function initEditPointModal({ onSave }) {
  const modal = ensureModal();
  saveHandler = onSave;

  // Close button
  modal.querySelector('[data-close-edit]')?.addEventListener('click', () => {
    restoreBackup();
    closeEditPointModal();
  });

  // Click outside closes (restoring state)
  modal.addEventListener('click', event => {
    if (event.target === modal) {
      restoreBackup();
      closeEditPointModal();
    }
  });

  // Image URL preview on input
  modal.querySelector('#editUrl')?.addEventListener('input', event => {
    revokePreviewObjectUrl();
    setValue('editImageFile', '');
    setImagePreview(event.target.value.trim());
  });

  modal.querySelector('#editImageFile')?.addEventListener('change', event => {
    setFilePreview(event.target.files[0]);
  });

  // Form submit
  modal.querySelector('#editPointForm')?.addEventListener('submit', async event => {
    event.preventDefault();

    if (!currentPoint || !saveHandler || isSaving) return;
    if (!validateForm()) return;

    const payload = createUpdatePayload(event.currentTarget);

    try {
      isSaving = true;
      setSaving(true);
      await saveHandler(currentPoint.id, payload);
      backupPoint = null;
      closeEditPointModal();
    } catch (error) {
      showError(error.message || 'No se pudo actualizar el punto');
    } finally {
      setSaving(false);
      isSaving = false;
    }
  });
}

export function openEditPointModal(point) {
  const modal = ensureModal();
  currentPoint = point;

  // Save backup for cancel/restore
  backupPoint = { ...point };

  setValue('editTipo', point.tipo);
  setValue('editDistrito', point.distrito);
  setValue('editSeccion', point.seccion);
  setValue('editEncargado', point.encargado);
  setValue('editCalle', point.calle);
  setValue('editColonia', point.colonia);
  setValue('editMunicipio', point.municipio);
  setValue('editUrl', point.url);
  setValue('editImageFile', '');
  revokePreviewObjectUrl();
  setImagePreview(point.url);

  modal.classList.add('open');
}

export function closeEditPointModal() {
  const modal = document.getElementById('editPointModal');
  if (modal) modal.classList.remove('open');
  currentPoint = null;
  setSaving(false);
  isSaving = false;
  revokePreviewObjectUrl();
  // backupPoint is not cleared here — caller clears on success
}

// Cleanup ESC listener when module is no longer needed (optional)
export function destroyEditPointModal() {
  if (escHandler) {
    document.removeEventListener('keydown', escHandler);
    escHandler = null;
  }
  const modal = document.getElementById('editPointModal');
  if (modal) modal.remove();
}

import {
    showError
} from '../ui/toast.js';
import { isImageUrl } from '../utils/media.js';

let currentPoint = null;
let saveHandler = null;

function ensureModal() {

  let modal =
    document.getElementById('editPointModal');

  if (modal) {
    return modal;
  }

  modal =
    document.createElement('div');

  modal.id = 'editPointModal';
  modal.className = 'modal-overlay';

      modal.innerHTML = `
    <div class="modal-card">
      <h2>Editar punto</h2>
      <form id="editPointForm" class="modal-form">
        <label for="editTipo">Tipo</label>
        <select id="editTipo" name="tipo" required>
          <option value="bardas">Bardas</option>
          <option value="lonas">Lonas</option>
          <option value="comites">Comités</option>
          <option value="casillas">Casillas</option>
        </select>

        <label for="editDistrito">Distrito</label>
        <input id="editDistrito" name="distrito" type="text" readonly>

        <label for="editSeccion">Sección</label>
        <input id="editSeccion" name="seccion" type="text" readonly>

        <label for="editEncargado">Encargado</label>
        <input id="editEncargado" name="encargado" type="text">

        <label for="editCalle">Calle</label>
        <input id="editCalle" name="calle" type="text">

        <label for="editColonia">Colonia</label>
        <input id="editColonia" name="colonia" type="text">

        <label for="editMunicipio">Municipio</label>
        <input id="editMunicipio" name="municipio" type="text">

        <label for="editUrl">URL</label>
        <input id="editUrl" name="url" type="text" placeholder="https://...">
        <div id="editImagePreview" class="edit-image-preview">
          Sin imagen
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-secondary-outline" data-close-edit>
            Cancelar
          </button>
          <button type="submit" class="btn-primary">
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  return modal;

}

function setValue(id, value) {

  const input =
    document.getElementById(id);

  if (input) {
    input.value = value ?? '';
  }

}

function setImagePreview(value) {

  const preview =
    document.getElementById('editImagePreview');

  if (!preview) {
    return;
  }

  preview.innerHTML = '';

  if (!isImageUrl(value)) {
    preview.textContent = 'Sin imagen';
    preview.className = 'edit-image-preview empty';
    return;
  }

  const image =
    document.createElement('img');

  image.src = value;
  image.alt = 'Imagen actual del punto';
  image.className = 'edit-image-thumbnail';

  preview.className = 'edit-image-preview';
  preview.appendChild(image);

}

function setSaving(isSaving) {

  const form =
    document.getElementById('editPointForm');

  const submit =
    form?.querySelector('button[type="submit"]');

  if (submit) {
    submit.disabled = isSaving;
    submit.textContent =
      isSaving
      ? 'Guardando...'
      : 'Guardar cambios';
  }

}

export function initEditPointModal({
  onSave
}) {

  const modal =
    ensureModal();

  saveHandler = onSave;

  modal
    .querySelector('[data-close-edit]')
    ?.addEventListener(
      'click',
      closeEditPointModal
    );

  modal.addEventListener('click', event => {

    if (event.target === modal) {
      closeEditPointModal();
    }

  });

  modal
    .querySelector('#editUrl')
    ?.addEventListener('input', event => {
      setImagePreview(event.target.value.trim());
    });

  modal
    .querySelector('#editPointForm')
    ?.addEventListener('submit', async event => {

      event.preventDefault();

      if (!currentPoint || !saveHandler) {
        return;
      }

      const formData =
        new FormData(event.currentTarget);

      const payload = {
        tipo: formData.get('tipo'),
        encargado: formData.get('encargado'),
        calle: formData.get('calle'),
        colonia: formData.get('colonia'),
        municipio: formData.get('municipio'),
        url: formData.get('url')
      };

      try {

        setSaving(true);

        await saveHandler(
          currentPoint.id,
          payload
        );

        closeEditPointModal();

      } catch (error) {

        showError(
          error.message ||
          'No se pudo actualizar el punto'
        );

      } finally {

        setSaving(false);

      }

    });

}

export function openEditPointModal(point) {

  const modal =
    ensureModal();

  currentPoint = point;

  setValue('editTipo', point.tipo);
  setValue('editDistrito', point.distrito);
  setValue('editSeccion', point.seccion);
  setValue('editEncargado', point.encargado);
  setValue('editCalle', point.calle);
  setValue('editColonia', point.colonia);
  setValue('editMunicipio', point.municipio);
  setValue('editUrl', point.url);
  setImagePreview(point.url);

  modal.classList.add('open');

}

export function closeEditPointModal() {

  const modal =
    document.getElementById('editPointModal');

  modal?.classList.remove('open');

  currentPoint = null;

}

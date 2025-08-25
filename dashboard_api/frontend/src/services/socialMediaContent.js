import axios from 'axios';
import { APP_CONFIG, API_CONFIG } from '../config/constants';

/**
 * Genera contenido para redes sociales usando el backend
 * @param {Object} params
 * @param {string} params.platform - Plataforma destino (ej: 'Instagram', 'Facebook', etc.)
 * @param {string} params.text - Prompt base para la generación
 * @param {string} params.lang - Código de idioma (ej: 'es', 'en')
 * @param {number} params.length - Longitud máxima del contenido
 * @returns {Promise<{content: string, cacheTime: number}>}
 */
export const generateSocialMediaContent = async ({ platform, text, lang = 'es', length = 150 }) => {
  const url = `${API_CONFIG.BASE_URL}/social-media-content/generate`;
  const payload = { platform, text, lang, length };
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.post(url, payload, { headers });
  return response.data;
}; 
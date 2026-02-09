/**
 * Normaliza category del usuario (puede venir como string o array) y devuelve array.
 * @param {object} user
 * @returns {string[]}
 */
export function getUserCategories(user) {
  if (!user?.category) return [];
  return Array.isArray(user.category) ? user.category : [user.category];
}

/**
 * Indica si el usuario tiene la categoría indicada.
 * @param {object} user
 * @param {string} category
 * @returns {boolean}
 */
export function hasCategory(user, category) {
  return getUserCategories(user).includes(category);
}

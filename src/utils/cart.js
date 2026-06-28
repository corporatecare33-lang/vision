const CART_KEY = "vision-cart";

export const getCartItems = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
};

export const saveCartItems = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
};

export const addCartItem = (item) => {
  const items = getCartItems();
  const existingIndex = items.findIndex(
    (cartItem) => cartItem.id === item.id && cartItem.option === item.option
  );

  if (existingIndex >= 0) {
    items[existingIndex] = {
      ...items[existingIndex],
      quantity: items[existingIndex].quantity + item.quantity,
    };
  } else {
    items.push(item);
  }

  saveCartItems(items);
  return items;
};

export const getCartCount = () =>
  getCartItems().reduce((total, item) => total + item.quantity, 0);

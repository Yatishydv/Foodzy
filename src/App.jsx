// --- React and Firebase Imports ---
import React, { useState, useEffect, useMemo, useRef } from 'react';

// Firebase SDKs
import app, { auth, db, firebaseAvailable } from './firebase';
import { 
    getAuth, 
    signInAnonymously, 
    signInWithCustomToken, 
    onAuthStateChanged,
    createUserWithEmailAndPassword, // ✅ NEW: Email/Password Signup
    signInWithEmailAndPassword,     // ✅ NEW: Email/Password Login
    GoogleAuthProvider,             // ✅ NEW: Google Auth Provider
    signInWithRedirect,             // 🔄 FIX: Changed from signInWithPopup
    getRedirectResult,              // 🔄 FIX: For handling redirect response
    signOut,                        // ✅ NEW: Sign Out
    updateProfile,                  // ✅ NEW: Update Profile
} from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, query, getDocs, where } from 'firebase/firestore';
// import { , doc, setDoc, onSnapshot, collection, query, getDocs } from "firebase/firestore";

// Icons
import {
  Home,
  ShoppingCart,
  Truck,
  MapPin,
  Search,
  Star,
  Clock,
  User,
  MessageSquare,
  Loader,
  Minus,
  Plus,
  X,
  ListOrdered,
  Heart,
  Check,
  ChevronRight,
  Wand2,
  Percent,
  Send,
  CloudOff,
Bike, // Added Bike for a more delivery-focused icon
MessageCircle, // Used for chat/contact
ClipboardCheck, // Used for confirmation status
Cookie, // Used for order details/prep
Archive, // Used for history
// ✅ NEW: Icons for AuthPage
Mail, 
Key, 
LogIn, 
UserPlus,
RefreshCw,
AlertTriangle,
} from 'lucide-react';



// --- IMPORTANT ---
// Remove all initializeApp or firebaseConfig code from here.
// Firebase is fully handled in firebase.js

console.log("✅ App.jsx: Firebase imported from firebase.js:", { app, auth, db, firebaseAvailable });


// preserve any other constants your app uses
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-foodzy-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const apiKey = "AIzaSyCqJmtwytjxw8tkCBdgChzfMy29CmukH74"; 

// --- MOCK DISH DATA (OVER 70 ITEMS) ---
const MOCK_DISHES = [
  // The Curry House (Indian) - 10 dishes (r101)
  { id: 'd001', name: 'Butter Chicken', desc: 'Creamy tomato-based curry, rich in flavor.', price: 15.99, imgUrl: 'assets/butterchicken.png', category: 'Mains', restaurantId: 'r101' },
  { id: 'd002', name: 'Garlic Naan', desc: 'Leavened bread with garlic, brushed with butter.', price: 3.99, imgUrl: 'assets/naan.png', category: 'Breads', restaurantId: 'r101' },
  { id: 'd003', name: 'Chicken Biryani', desc: 'Aromatic basmati rice cooked with spiced chicken.', price: 18.50, imgUrl: 'assets/cknbiryani.png', category: 'Rice & Biryani', restaurantId: 'r101' },
  { id: 'd004', name: 'Aloo Gobi', desc: 'Potatoes and cauliflower sautéed with spices.', price: 12.00, imgUrl: 'assets/aalogobhi.png', category: 'Mains', restaurantId: 'r101' },
  { id: 'd005', name: 'Tandoori Roti', desc: 'Whole wheat bread baked in a clay oven.', price: 2.50, imgUrl: 'assets/tandoriroti.png', category: 'Breads', restaurantId: 'r101' },
  { id: 'd006', name: 'Paneer Tikka Masala', desc: 'Cubes of cottage cheese in a rich gravy.', price: 16.99, imgUrl: 'assets/paneer-tikka-masa.png', category: 'Mains', restaurantId: 'r101' },
  { id: 'd007', name: 'Dal Makhani', desc: 'Black lentils and kidney beans cooked slowly.', price: 13.50, imgUrl: 'assets/dalmakhani.png', category: 'Mains', restaurantId: 'r101' },
  { id: 'd008', name: 'Mango Lassi', desc: 'Sweet yogurt drink blended with fresh mango.', price: 5.00, imgUrl: 'assets/mangolassi.png', category: 'Beverages', restaurantId: 'r101' },
  { id: 'd009', name: 'Jeera Rice', desc: 'Basmati rice tempered with cumin seeds.', price: 6.50, imgUrl: 'assets/jeerarice.jpeg', category: 'Rice & Biryani', restaurantId: 'r101' },
  { id: 'd010', name: 'Samosa (2 pcs)', desc: 'Crispy fried pastries filled with spiced potatoes.', price: 4.50, imgUrl: 'assets/samosa.png', category: 'Appetizers', restaurantId: 'r101' },

  // Pizza Planet (Italian) - 10 dishes (r102)
  { id: 'd011', name: 'Pepperoni Pizza', desc: 'Classic pepperoni and mozzarella on marinara.', price: 18.50, imgUrl: 'assets/PepperoniPizza.png', category: 'Pizzas', restaurantId: 'r102' },
  { id: 'd012', name: 'Caesar Salad', desc: 'Crisp romaine, croutons, and creamy dressing.', price: 8.00, imgUrl: 'assets/CaesarSalad.png', category: 'Salads', restaurantId: 'r102' },
  { id: 'd013', name: 'Margherita Pizza', desc: 'Fresh mozzarella, basil, and tomato sauce.', price: 16.00, imgUrl: 'assets/Margherita Pizza.png', category: 'Pizzas', restaurantId: 'r102' },
  { id: 'd014', name: 'Spaghetti Bolognese', desc: 'Beef ragu simmered for hours over spaghetti.', price: 17.50, imgUrl: 'assets/Spaghetti Bolognese.png', category: 'Pasta', restaurantId: 'r102' },
  { id: 'd015', name: 'Garlic Knots (6 pcs)', desc: 'Baked dough tied in knots, coated in garlic butter.', price: 6.50, imgUrl: 'assets/Garlic Knots.png', category: 'Sides', restaurantId: 'r102' },
  { id: 'd016', name: 'Tiramisu', desc: 'Layers of coffee-soaked ladyfingers and mascarpone.', price: 9.00, imgUrl: 'assets/Tiramisu.png', category: 'Desserts', restaurantId: 'r102' },
  { id: 'd017', name: 'Veggie Supreme Pizza', desc: 'Bell peppers, olives, mushrooms, and onions.', price: 19.50, imgUrl: 'assets/Veggie Supreme Pizza.png', category: 'Pizzas', restaurantId: 'r102' },
  { id: 'd018', name: 'Fettuccine Alfredo', desc: 'Fettuccine pasta tossed in a creamy parmesan sauce.', price: 16.50, imgUrl: 'assets/Fettuccine Alfredo.png', category: 'Pasta', restaurantId: 'r102' },
  { id: 'd019', name: 'Minestrone Soup', desc: 'Hearty vegetable soup with pasta and beans.', price: 7.00, imgUrl: 'assets/Minestrone Soup.png', category: 'Appetizers', restaurantId: 'r102' },
  { id: 'd020', name: 'Soda (Can)', desc: 'Assorted canned sodas.', price: 2.00, imgUrl: 'assets/soda.png', category: 'Beverages', restaurantId: 'r102' },

  // Veggie Delights (Vegan) - 10 dishes (r103)
  { id: 'd021', name: 'Tofu Stir-fry', desc: 'Wok-tossed tofu with seasonal greens and ginger sauce.', price: 14.50, imgUrl: 'assets/Tofu Stir-fry.png', category: 'Mains', restaurantId: 'r103' },
  { id: 'd022', name: 'Avocado Toast', desc: 'Sourdough toast topped with smashed avocado.', price: 7.00, imgUrl: 'assets/Avocado Toast.png', category: 'Breakfast', restaurantId: 'r103' },
  { id: 'd023', name: 'Lentil Soup', desc: 'Warm and comforting soup made with red lentils.', price: 6.00, imgUrl: 'assets/Lentil Soup.png', category: 'Appetizers', restaurantId: 'r103' },
  { id: 'd024', name: 'Quinoa Bowl', desc: 'Quinoa base with roasted vegetables and lemon vinaigrette.', price: 13.00, imgUrl: 'assets/Quinoa Bowl.png', category: 'Bowls', restaurantId: 'r103' },
  { id: 'd025', name: 'Vegan Wrap', desc: 'Tortilla filled with hummus, falafel, and crisp veggies.', price: 11.50, imgUrl: 'assets/Vegan Wrap.png', category: 'Sandwiches & Wraps', restaurantId: 'r103' },
  { id: 'd026', name: 'Green Smoothie', desc: 'Spinach, banana, and almond milk blended smoothly.', price: 7.50, imgUrl: 'assets/Green Smoothie.png', category: 'Beverages', restaurantId: 'r103' },
  { id: 'd027', name: 'Sweet Potato Fries', desc: 'Crispy sweet potato fries served with vegan aioli.', price: 5.50, imgUrl: 'assets/Sweet Potato Fries.png', category: 'Sides', restaurantId: 'r103' },
  { id: 'd028', name: 'Black Bean Burger', desc: 'House-made black bean patty on a whole wheat bun.', price: 14.00, imgUrl: 'assets/Black Bean Burger.png', category: 'Mains', restaurantId: 'r103' },
  { id: 'd029', name: 'Chia Seed Pudding', desc: 'Overnight chia seeds soaked in coconut milk with berries.', price: 8.50, imgUrl: 'assets/Chia Seed Pudding.png', category: 'Desserts', restaurantId: 'r103' },
  { id: 'd030', name: 'Kale Caesar Salad (V)', desc: 'Kale and romaine with a creamy cashew-based dressing.', price: 12.50, imgUrl: 'assets/Kale Caesar Salad (V).png', category: 'Salads', restaurantId: 'r103' },

  // Wok Master (Chinese) - 10 dishes (r104)
  { id: 'd031', name: 'Chilli Chicken', desc: 'Spicy crispy chicken with onions and peppers.', price: 16.99, imgUrl: 'assets/Chilli Chicken.png', category: 'Mains', restaurantId: 'r104' },
  { id: 'd032', name: 'Veg Hakka Noodles', desc: 'Hakka noodles tossed with vegetables.', price: 10.00, imgUrl: 'assets/Veg Hakka Noodles.png', category: 'Noodles', restaurantId: 'r104' },
  { id: 'd033', name: 'Veg Spring Rolls (4 pcs)', desc: 'Crispy rolls filled with shredded cabbage and carrots.', price: 5.50, imgUrl: 'assets/Veg Spring Rolls.png', category: 'Appetizers', restaurantId: 'r104' },
  { id: 'd034', name: 'Chicken Fried Rice', desc: 'Wok-tossed rice with diced chicken and egg.', price: 14.00, imgUrl: 'assets/Chicken Fried Rice.png', category: 'Rice', restaurantId: 'r104' },
  { id: 'd035', name: 'Kung Pao Shrimp', desc: 'Spicy stir-fry with shrimp, peanuts, and vegetables.', price: 19.99, imgUrl: 'assets/Kung Pao Shrimp.png', category: 'Mains', restaurantId: 'r104' },
  { id: 'd036', name: 'Hot & Sour Soup', desc: 'Spicy and tangy thick soup.', price: 6.00, imgUrl: 'assets/Hot & Sour Soup.png', category: 'Soup', restaurantId: 'r104' },
  { id: 'd037', name: 'Schezwan Noodles (Veg)', desc: 'Spicy noodles with Szechuan sauce.', price: 11.50, imgUrl: 'assets/Schezwan Noodles (Veg).png', category: 'Noodles', restaurantId: 'r104' },
  { id: 'd038', name: 'Pork Dumplings (Steamed)', desc: 'Delicate steamed dumplings with savory pork filling.', price: 8.00, imgUrl: 'assets/Pork Dumplings (Steamed).png', category: 'Appetizers', restaurantId: 'r104' },
  { id: 'd039', name: 'Manchurian Veggie Balls', desc: 'Fried vegetable balls tossed in a rich Manchurian sauce.', price: 13.00, imgUrl: 'assets/Manchurian Veggie Balls.png', category: 'Mains', restaurantId: 'r104' },
  { id: 'd040', name: 'Fortune Cookies (3 pcs)', desc: 'Crispy cookies with fun fortunes inside.', price: 3.00, imgUrl: 'assets/Fortune Cookies.png', category: 'Desserts', restaurantId: 'r104' },
  
  // The Burger Stop (r105)
  { id: 'd041', name: 'Classic Cheeseburger', desc: 'Beef patty, cheddar, lettuce, tomato, pickle.', price: 12.00, imgUrl: 'assets/Classic Cheeseburger.png', category: 'Burgers', restaurantId: 'r105' },
  { id: 'd042', name: 'Fries', desc: 'Crispy golden potato fries.', price: 4.00, imgUrl: 'assets/Fries.png', category: 'Sides', restaurantId: 'r105' },
  { id: 'd043', name: 'Veggie Burger', desc: 'Black bean patty with aioli.', price: 11.50, imgUrl: 'assets/Veggie Burger.png', category: 'Burgers', restaurantId: 'r105' },
  { id: 'd044', name: 'Onion Rings', desc: 'Thick cut onion rings.', price: 5.50, imgUrl: 'assets/Onion Rings.png', category: 'Sides', restaurantId: 'r105' },

  // Sushi Zen (r106)
  { id: 'd045', name: 'California Roll', desc: 'Crab, avocado, cucumber.', price: 11.00, imgUrl: 'assets/California Roll.png', category: 'Rolls', restaurantId: 'r106' },
  { id: 'd046', name: 'Spicy Tuna Roll', desc: 'Tuna, spicy mayo, sesame.', price: 13.00, imgUrl: 'assets/Spicy Tuna Roll.png', category: 'Rolls', restaurantId: 'r106' },
  { id: 'd047', name: 'Salmon Nigiri (2 pcs)', desc: 'Fresh salmon on rice.', price: 9.00, imgUrl: 'assets/Salmon Nigiri.png', category: 'Nigiri', restaurantId: 'r106' },
  { id: 'd048', name: 'Miso Soup', desc: 'Soybean paste soup with tofu.', price: 4.00, imgUrl: 'assets/Miso Soup.png', category: 'Soup', restaurantId: 'r106' },

  // Taco Fiesta (Mexican) (r107)
  { id: 'd049', name: 'Beef Tacos (2 pcs)', desc: 'Ground beef, salsa, cheese, corn tortilla.', price: 10.00, imgUrl: 'assets/Beef Tacos.png', category: 'Tacos', restaurantId: 'r107' },
  { id: 'd050', name: 'Chicken Burrito', desc: 'Rice, beans, chicken, sour cream, wrapped.', price: 14.00, imgUrl: 'assets/Chicken Burrito.png', category: 'Burritos', restaurantId: 'r107' },
  { id: 'd051', name: 'Guacamole & Chips', desc: 'Fresh avocado dip with corn chips.', price: 9.00, imgUrl: 'assets/Guacamole & Chips.png', category: 'Appetizers', restaurantId: 'r107' },
  { id: 'd052', name: 'Churros', desc: 'Cinnamon sugar pastry sticks with dipping sauce.', price: 6.50, imgUrl: 'assets/Churros.png', category: 'Desserts', restaurantId: 'r107' },

  // Mediterranean Grill (r108)
  { id: 'd053', name: 'Chicken Shawarma Plate', desc: 'Marinated chicken, rice, salad, hummus.', price: 18.00, imgUrl: 'assets/Chicken Shawarma Plate.png', category: 'Plates', restaurantId: 'r108' },
  { id: 'd054', name: 'Falafel Wrap', desc: 'Chickpea fritters, vegetables in a pita.', price: 12.00, imgUrl: 'assets/Falafel Wrap.png', category: 'Wraps', restaurantId: 'r108' },
  { id: 'd055', name: 'Hummus Plate', desc: 'Creamy hummus with olive oil and warm pita.', price: 8.50, imgUrl: 'assets/Hummus Plate.png', category: 'Appetizers', restaurantId: 'r108' },
  { id: 'd056', name: 'Greek Salad', desc: 'Cucumbers, tomatoes, olives, feta.', price: 11.00, imgUrl: 'assets/Greek Salad.png', category: 'Salads', restaurantId: 'r108' },

  // Cafe Latte (r109)
  { id: 'd057', name: 'Cappuccino', desc: 'Espresso with foamed milk.', price: 4.50, imgUrl: 'assets/Cappuccino.png', category: 'Coffee', restaurantId: 'r109' },
  { id: 'd058', name: 'Croissant', desc: 'Buttery, flaky pastry.', price: 3.50, imgUrl: 'assets/Croissant.png', category: 'Pastries', restaurantId: 'r109' },
  { id: 'd059', name: 'Iced Mocha', desc: 'Chocolate, espresso, milk over ice.', price: 5.50, imgUrl: 'assets/Iced Mocha.png', category: 'Coffee', restaurantId: 'r109' },
  { id: 'd060', name: 'Almond Biscotti', desc: 'Twice-baked almond cookies.', price: 4.00, imgUrl: 'assets/Almond Biscotti.png', category: 'Pastries', restaurantId: 'r109' },
  
  // Asian Fusion Bowl (r110)
  { id: 'd061', name: 'Spicy Salmon Poke Bowl', desc: 'Salmon, rice, avocado, spicy mayo.', price: 17.50, imgUrl: 'assets/Spicy Salmon Poke Bowl.png', category: 'Bowls', restaurantId: 'r110' },
  { id: 'd062', name: 'Kimchi Fried Rice', desc: 'Kimchi, rice, egg, and vegetables wok-tossed.', price: 15.00, imgUrl: 'assets/Kimchi Fried Rice.png', category: 'Rice', restaurantId: 'r110' },
  { id: 'd063', name: 'Gyoza (6 pcs)', desc: 'Pan-fried Japanese pork dumplings.', price: 8.50, imgUrl: 'assets/Gyoza.png', category: 'Appetizers', restaurantId: 'r110' },
  { id: 'd064', name: 'Boba Tea', desc: 'Milk tea with chewy tapioca pearls.', price: 6.00, imgUrl: 'assets/Boba Tea.png', category: 'Beverages', restaurantId: 'r110' },

  // Donut Heaven (r111)
  { id: 'd065', name: 'Glazed Donut', desc: 'Classic raised donut with sweet glaze.', price: 2.50, imgUrl: 'assets/Glazed Donut.png', category: 'Donuts', restaurantId: 'r111' },
  { id: 'd066', name: 'Chocolate Frosted', desc: 'Donut with thick chocolate frosting.', price: 3.00, imgUrl: 'assets/Chocolate Frosted.png', category: 'Donuts', restaurantId: 'r111' },
  { id: 'd067', name: 'Jelly Filled', desc: 'Donut filled with raspberry jelly.', price: 3.50, imgUrl: 'assets/Jelly Filled.png', category: 'Donuts', restaurantId: 'r111' },
  { id: 'd068', name: 'Coffee (Small)', desc: 'Freshly brewed hot coffee.', price: 2.00, imgUrl: 'assets/Coffee.png', category: 'Beverages', restaurantId: 'r111' },

  // Healthy Hues (Salads) (r112)
  { id: 'd069', name: 'Cobb Salad', desc: 'Chicken, bacon, egg, avocado, blue cheese.', price: 16.00, imgUrl: 'assets/Cobb Salad.png', category: 'Salads', restaurantId: 'r112' },
  { id: 'd070', name: 'Chicken Avo Wrap', desc: 'Grilled chicken and avocado in a wheat wrap.', price: 14.50, imgUrl: 'assets/Chicken Avo Wrap.png', category: 'Wraps', restaurantId: 'r112' },
  { id: 'd071', name: 'Protein Bowl', desc: 'Quinoa, salmon, sweet potato, greens.', price: 18.50, imgUrl: 'assets/Protein Bowl.png', category: 'Bowls', restaurantId: 'r112' },
  { id: 'd072', name: 'Fresh Juice', desc: 'Freshly squeezed orange and carrot juice.', price: 6.00, imgUrl: 'assets/Fresh Juice.png', category: 'Beverages', restaurantId: 'r112' },

  // Even more dishes for diversity
  { id: 'd073', name: 'Vegan Pad Thai', desc: 'Rice noodles with peanuts, sprouts, and lime.', price: 15.00, imgUrl: 'assets/Vegan Pad Thai.png', category: 'Noodles', restaurantId: 'r103' },
  { id: 'd074', name: 'Double Cheese Pizza', desc: 'Extra mozzarella and parmesan on classic base.', price: 17.50, imgUrl: 'assets/Double Cheese Pizza.png', category: 'Pizzas', restaurantId: 'r102' },
  { id: 'd075', name: 'Spicy Chicken Wings (6pc)', desc: 'Crispy fried wings tossed in buffalo sauce.', price: 11.00, imgUrl: 'assets/Spicy Chicken Wings.png', category: 'Appetizers', restaurantId: 'r105' },
  { id: 'd076', name: 'Lamb Seekh Kebab', desc: 'Ground lamb skewers grilled in tandoor.', price: 14.50, imgUrl: 'assets/kebab.png', category: 'Appetizers', restaurantId: 'r101' },
  { id: 'd077', name: 'Shrimp Tempura (4pc)', desc: 'Lightly battered and fried shrimp.', price: 10.00, imgUrl: 'assets/Shrimp Tempura.png', category: 'Appetizers', restaurantId: 'r106' },
  { id: 'd078', name: 'Fish Tacos (2 pcs)', desc: 'Battered fish, slaw, chipotle cream.', price: 13.00, imgUrl: 'assets/Fish Tacos.png', category: 'Tacos', restaurantId: 'r107' },
  { id: 'd079', name: 'Baklava (3 pcs)', desc: 'Layered pastry filled with nuts and syrup.', price: 7.00, imgUrl: 'assets/Baklava.png', category: 'Desserts', restaurantId: 'r108' },
  { id: 'd080', name: 'Pistachio Gelato', desc: 'Rich Italian pistachio ice cream.', price: 8.00, imgUrl: 'assets/Pistachio Gelato.png', category: 'Desserts', restaurantId: 'r102' },
  { id: 'd081', name: 'Vegetable Chow Mein', desc: 'Stir-fried noodles with crisp vegetables.', price: 12.00, imgUrl: 'assets/Vegetable Chow Mein.png', category: 'Noodles', restaurantId: 'r104' },
  { id: 'd082', name: 'Fresh Fruit Smoothie', desc: 'Mixed berries, banana, and water blend.', price: 6.50, imgUrl: 'assets/Fresh Fruit Smoothie.png', category: 'Beverages', restaurantId: 'r112' },
  { id: 'd083', name: 'Double Espresso', desc: 'Strong, concentrated coffee shot.', price: 3.50, imgUrl: 'assets/Double Espresso.png', category: 'Coffee', restaurantId: 'r109' },
  { id: 'd084', name: 'Chocolate Dipped Donut', desc: 'Classic donut dipped in dark chocolate.', price: 3.50, imgUrl: 'assets/Chocolate Dipped Donut.png', category: 'Donuts', restaurantId: 'r111' },

  // More dishes to reach over 70
  { id: 'd085', name: 'Spicy Beef Burrito', desc: 'Large burrito with spicy shredded beef.', price: 15.00, imgUrl: 'assets/Spicy Beef Burrito.png', category: 'Burritos', restaurantId: 'r107' },
  { id: 'd086', name: 'Chicken Skewers (2 pc)', desc: 'Grilled chicken skewers with sauce.', price: 12.00, imgUrl: 'assets/Chicken Skewers.png', category: 'Plates', restaurantId: 'r108' },
  { id: 'd087', name: 'Veggie Pizza Slice', desc: 'Single slice of veggie pizza.', price: 4.00, imgUrl: 'assets/Veggie Pizza Slice.png', category: 'Pizzas', restaurantId: 'r102' },
  { id: 'd088', name: 'Palak Paneer', desc: 'Spinach and cottage cheese curry.', price: 14.99, imgUrl: 'assets/Palak Paneer.png', category: 'Mains', restaurantId: 'r101' },
  { id: 'd089', name: 'Sweet & Sour Pork', desc: 'Crispy pork pieces in classic sweet and sour sauce.', price: 17.50, imgUrl: 'assets/Sweet & Sour Pork.png', category: 'Mains', restaurantId: 'r104' },
  { id: 'd090', name: 'Chocolate Milkshake', desc: 'Thick, creamy chocolate milkshake.', price: 7.00, imgUrl: 'assets/Chocolate Milkshake.png', category: 'Beverages', restaurantId: 'r105' },
];

// --- MOCK RESTAURANT DATA (EXPANDED TO 12 RESTAURANTS) ---
// FIX APPLIED: Using the direct raw content URL from GitHub for ALL restaurants.
const UNIVERSAL_IMAGE_URL1 = 'https://raw.githubusercontent.com/Yatishydv/Foodzy/main/assets/The%20Curry%20House.png';
const UNIVERSAL_IMAGE_URL2 = 'https://raw.githubusercontent.com/Yatishydv/Foodzy/main/assets/Pizza%20Planet.png';
const UNIVERSAL_IMAGE_URL3 = 'https://raw.githubusercontent.com/Yatishydv/Foodzy/main/assets/Veggie%20Delights.png';
const UNIVERSAL_IMAGE_URL4 = 'https://raw.githubusercontent.com/Yatishydv/Foodzy/main/assets/Wok%20Master.png';
const UNIVERSAL_IMAGE_URL5 = 'https://raw.githubusercontent.com/Yatishydv/Foodzy/main/assets/TheBurgerStop.png';
const UNIVERSAL_IMAGE_URL6 = 'https://raw.githubusercontent.com/Yatishydv/Foodzy/main/assets/Sushi%20Zen.png';
const UNIVERSAL_IMAGE_URL7 = 'https://raw.githubusercontent.com/Yatishydv/Foodzy/main/assets/Taco%20Fiesta.png';
const UNIVERSAL_IMAGE_URL8 = 'https://raw.githubusercontent.com/Yatishydv/Foodzy/main/assets/Mediterranean%20Grill.png';
const UNIVERSAL_IMAGE_URL9 = 'https://raw.githubusercontent.com/Yatishydv/Foodzy/main/assets/Cafe%20Latte.png';
const UNIVERSAL_IMAGE_URL10 = 'https://raw.githubusercontent.com/Yatishydv/Foodzy/main/assets/Asian%20Fusion%20Bowl.png';
const UNIVERSAL_IMAGE_URL11 = 'https://raw.githubusercontent.com/Yatishydv/Foodzy/main/assets/Donut%20Heaven.png';
const UNIVERSAL_IMAGE_URL12 = 'https://raw.githubusercontent.com/Yatishydv/Foodzy/main/assets/Healthy%20Hues.png';



const MOCK_RESTAURANTS = [
  // Original 4 
  { id: 'r101', name: 'The Curry House', cuisine: 'Indian', rating: 4.5, deliveryTime: 35, imageUrl: UNIVERSAL_IMAGE_URL1, seoKeywords: 'Best Biryani Delivery, North Indian Food' },
  { id: 'r102', name: 'Pizza Planet', cuisine: 'Italian', rating: 4.8, deliveryTime: 25, imageUrl: UNIVERSAL_IMAGE_URL2, seoKeywords: 'Fastest Pizza Online, Italian Delivery' },
  { id: 'r103', name: 'Veggie Delights', cuisine: 'Vegan', rating: 4.3, deliveryTime: 40, imageUrl: UNIVERSAL_IMAGE_URL3, seoKeywords: 'Healthy Vegan Bowls, Plant-Based Meals' },
  { id: 'r104', name: 'Wok Master', cuisine: 'Chinese', rating: 4.6, deliveryTime: 30, imageUrl: UNIVERSAL_IMAGE_URL4, seoKeywords: 'Authentic Chinese Noodles, Fast Wok' },
  // New 8 (All using the same image)
  { id: 'r105', name: 'The Burger Stop', cuisine: 'American', rating: 4.7, deliveryTime: 20, imageUrl: UNIVERSAL_IMAGE_URL5, seoKeywords: 'Best Gourmet Burgers, Fast Food' },
  { id: 'r106', name: 'Sushi Zen', cuisine: 'Japanese', rating: 4.9, deliveryTime: 30, imageUrl: UNIVERSAL_IMAGE_URL6, seoKeywords: 'Fresh Sushi Delivery, Japanese Rolls' },
  { id: 'r107', name: 'Taco Fiesta', cuisine: 'Mexican', rating: 4.2, deliveryTime: 28, imageUrl: UNIVERSAL_IMAGE_URL7, seoKeywords: 'Authentic Tacos, Burrito Delivery' },
  { id: 'r108', name: 'Mediterranean Grill', cuisine: 'Mediterranean', rating: 4.4, deliveryTime: 38, imageUrl: UNIVERSAL_IMAGE_URL8, seoKeywords: 'Healthy Shawarma, Falafel Wraps' },
  { id: 'r109', name: 'Cafe Latte', cuisine: 'Coffee & Pastries', rating: 4.1, deliveryTime: 15, imageUrl: UNIVERSAL_IMAGE_URL9, seoKeywords: 'Iced Coffee, Bakery Delivery' },
  { id: 'r110', name: 'Asian Fusion Bowl', cuisine: 'Asian', rating: 4.5, deliveryTime: 32, imageUrl: UNIVERSAL_IMAGE_URL10, seoKeywords: 'Poke Bowls, Kimchi Rice' },
  { id: 'r111', name: 'Donut Heaven', cuisine: 'Dessert', rating: 4.0, deliveryTime: 18, imageUrl: UNIVERSAL_IMAGE_URL11, seoKeywords: 'Donuts and Sweets, Dessert Delivery' },
  { id: 'r112', name: 'Healthy Hues', cuisine: 'Salads & Wraps', rating: 4.6, deliveryTime: 25, imageUrl: UNIVERSAL_IMAGE_URL12, seoKeywords: 'Low Calorie Salads, Protein Bowls' },
];

const MOCK_DAILY_DEALS = [
    { id: 'deal1', title: '50% off all Curries!', subtitle: 'Min order $20. The Curry House', restaurantId: 'r101', color: 'bg-red-500' },
    { id: 'deal2', title: 'Free Delivery', subtitle: 'On all orders over $15. Pizza Planet', restaurantId: 'r102', color: 'bg-yellow-500' },
    { id: 'deal3', title: 'Vegan Special Bundle', subtitle: 'Save $5 on Tofu Stir-fry combo. Veggie Delights', restaurantId: 'r103', color: 'bg-green-500' },
    { id: 'deal4', title: 'Buy 1 Get 1 Burger!', subtitle: 'All day, every Tuesday. The Burger Stop', restaurantId: 'r105', color: 'bg-blue-500' }, 
    { id: 'deal5', title: '$5 Off Wok Orders', subtitle: 'Order from Wok Master. Use code WOK5', restaurantId: 'r104', color: 'bg-purple-500' }, 
    { id: 'deal6', title: 'Free Miso Soup', subtitle: 'With any Sushi Roll purchase. Sushi Zen', restaurantId: 'r106', color: 'bg-pink-500' }, 
    { id: 'deal7', title: 'Taco Tuesday!', subtitle: '25% off all tacos. Taco Fiesta', restaurantId: 'r107', color: 'bg-orange-500' }, 
    { id: 'deal8', title: 'Pastry & Coffee Deal', subtitle: 'Get a free coffee with any pastry. Cafe Latte', restaurantId: 'r109', color: 'bg-indigo-500' }, 
];

// --- ANALYTICS SIMULATION ---
const ANALYTICS_EVENTS = [];

const trackAnalytics = (eventName, eventProperties = {}) => {
  const timestamp = new Date().toISOString();
  const event = { timestamp, eventName, ...eventProperties };
  ANALYTICS_EVENTS.push(event);
  console.log('ANALYTICS EVENT:', event);

  // For this single-file app, we'll rely on the console log for reporting evidence.
};

// --- GEMINI API HELPER (ADAPTED FOR CHATBOT) ---

/**
 * Calls the Gemini API for text generation with exponential backoff.
 * NOTE: Using gemini-2.5-flash-preview-09-2025 as the default recommended model.
 */
const geminiGenerateContent = async (userQuery, retries = 3) => {
    // Using the recommended model for text generation
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    // System instruction for food-related conversation
    const systemInstruction = "You are Foodzy AI, a helpful and friendly culinary chatbot. Provide recommendations, dietary information, and general food knowledge. Keep your answers concise and encouraging. Do not mention your model name or training status.";

    const payload = {
        contents: [{ role: 'user', parts: [{ text: userQuery }] }],
        systemInstruction: {
            parts: [{ text: systemInstruction }]
        },
    };

    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                if (response.status === 429 && i < retries - 1) {
                    const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue; // Retry
                }
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const result = await response.json();
            return result.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I ran into an error getting that information.";

        } catch (error) {
            console.error(`Gemini API call failed (Attempt ${i + 1}):`, error);
            if (i === retries - 1) throw error;
            const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return "API access error after multiple retries.";
};


// --- AUTH HELPER FUNCTION (Moved to Global Scope for App component access) ---
const getErrorMessage = (errorCode) => {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'Invalid email address format.';
        case 'auth/user-not-found':
            return 'No user found with this email.';
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Incorrect password or invalid credentials.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/email-already-in-use':
            return 'This email is already registered. Try logging in.';
        case 'auth/cancelled-popup-request': // Handles redirect case failure
        case 'auth/popup-closed-by-user':
            return 'Sign-in window was closed or interrupted. Please try again.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection.';
        case 'auth/operation-not-supported-in-this-environment':
            return 'Sign-in is blocked by the browser environment (e.g., COOP policy). Try using a direct redirect link.';
        default:
            return `An unknown error occurred. Code: ${errorCode}. Please try again.`;
    }
};


// --- HELPER COMPONENTS ---

/**
 * Component to display a simple rotating 3D shape (simulating animated food).
 * Uses THREE.js (assuming it's loaded via CDN).
 */
const AnimatedFoodScene = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        // Ensure THREE is loaded before proceeding
        if (!window.THREE || !mountRef.current) return;

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const scene = new window.THREE.Scene();
        const camera = new window.THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new window.THREE.WebGLRenderer({ antialias: true, alpha: true }); 
        
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);

        // 1. Torus (Central, Reddish - existing)
        const torusGeometry = new window.THREE.TorusGeometry(1, 0.4, 16, 100);
        const torusMaterial = new window.THREE.MeshPhongMaterial({ color: 0xed6e7e, shininess: 150 }); // Foodzy Red/Pink color
        const torus = new window.THREE.Mesh(torusGeometry, torusMaterial);
        scene.add(torus);
        torus.position.set(0, 0, 0);

        // NOTE: Sphere and Cube objects removed as requested

        // Add lighting
        const ambientLight = new window.THREE.AmbientLight(0x404040); 
        scene.add(ambientLight);
        const directionalLight = new window.THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5).normalize();
        scene.add(directionalLight);

        camera.position.z = 3;

        const animate = () => {
            if (!mountRef.current) return; // Stop animation if component is unmounted
            requestAnimationFrame(animate);
            
            // Torus rotation (slow-ish)
            torus.rotation.x += 0.005;
            torus.rotation.y += 0.01;

            // NOTE: Box and Sphere animation removed as requested

            renderer.render(scene, camera);
        };

        animate();

        // Handle window resize
        const handleResize = () => {
            const newWidth = mountRef.current.clientWidth;
            const newHeight = mountRef.current.clientHeight;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        };
        window.addEventListener('resize', handleResize);


        return () => {
            // Cleanup check
            window.removeEventListener('resize', handleResize);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
            // NOTE: Disposal of removed objects removed
        };
    }, []);

    if (!window.THREE) {
        return <div className="w-full h-full min-h-[300px] md:min-h-[400px] absolute inset-0 z-0 bg-gray-100 flex items-center justify-center text-gray-500">Loading 3D Engine...</div>;
    }
    
    return <div ref={mountRef} className="w-full h-full min-h-[300px] md:min-h-[400px] absolute inset-0 z-0"></div>;
};


// MODIFIED: Added setCurrentDeliveryAddress prop
const LocationSelector = ({ location, setLocation, setModalMessage, setCurrentDeliveryAddress }) => {
    const handleLocate = () => {
        // MKT311: Location Service Simulation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Reverse geocode using OpenStreetMap Nominatim API to get city name
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            const placeName =
                data.address?.city ||
                data.address?.town ||
                data.address?.village ||
                data.address?.suburb ||
                data.display_name ||
                `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;

            setLocation(placeName);
            // ✅ NEW: Update the current delivery address state when GPS location is found
            setCurrentDeliveryAddress(placeName); 
            setModalMessage(`Delivering to: ${placeName}`);
            trackAnalytics('location_update', { method: 'GPS', location: placeName });
        })
        .catch(() => {
            const fallbackLocation = "Sector 75, Jalandhar";
            setLocation(fallbackLocation);
            setCurrentDeliveryAddress(fallbackLocation); // ✅ NEW: Set fallback address
            setModalMessage(`Couldn't fetch location name. Defaulting to ${fallbackLocation}`);
            trackAnalytics('location_update', { method: 'Fallback', location: fallbackLocation });
        });
},

                (error) => {
                    // Fallback or error handling
                    const fallbackLocation = "Sector 75, Jalandhar";
                    setLocation(fallbackLocation);
                    setCurrentDeliveryAddress(fallbackLocation); // ✅ NEW: Set fallback address
                    setModalMessage(`Geolocation failed: ${error.message}. Falling back to default location: ${fallbackLocation}`);
                    trackAnalytics('location_update', { method: 'Fallback', location: fallbackLocation });
                }
            );
        } else {
            const fallbackLocation = "Sector 75, Jalandhar";
            setLocation(fallbackLocation);
            setCurrentDeliveryAddress(fallbackLocation); // ✅ NEW: Set fallback address
            setModalMessage("Geolocation is not supported by this environment. Using default location.");
            trackAnalytics('location_update', { method: 'Unsupported', location: fallbackLocation });
        }
    };

    return (
        <div className="flex items-center space-x-2 text-gray-700 cursor-pointer group" onClick={handleLocate}>
            <MapPin className="w-5 h-5 mr-1 text-[#E94458] group-hover:text-red-700 transition" />
            <span className="font-semibold text-sm truncate max-w-[150px] sm:max-w-full group-hover:underline">{location}</span>
            <span className="text-xs text-blue-500 font-medium">(Change)</span>
        </div>
    );
};

// MODIFIED: Added setCurrentDeliveryAddress prop
const NavigationBar = ({ setCurrentPage, cartItemCount, location, setLocation, setModalMessage, isLoggedIn, handleSignOut, setCurrentDeliveryAddress }) => (
  // Navigation fixed at top (z-20)
  <header className="fixed top-0 left-0 right-0 bg-white shadow-lg z-20">
    <div className="container mx-auto px-4 py-3 flex justify-between items-center max-w-7xl">
      <div className="flex items-center space-x-6">
        <h1 className="text-3xl font-extrabold text-[#E94458] cursor-pointer" onClick={() => setCurrentPage('home')}>
          Foodzy
        </h1>
        <div className="hidden sm:flex items-center text-gray-600">
          <LocationSelector location={location} setLocation={setLocation} setModalMessage={setModalMessage} setCurrentDeliveryAddress={setCurrentDeliveryAddress} />
        </div>
        </div>
      <nav className="flex space-x-6">
        <button onClick={() => setCurrentPage('home')} className="flex flex-col items-center text-gray-700 hover:text-[#E94458] transition">
          <Home className="w-6 h-6" />
          <span className="text-xs hidden sm:block">Home</span>
        </button>
        <button onClick={() => setCurrentPage('tracking')} className="flex flex-col items-center text-gray-700 hover:text-[#E94458] transition">
          <Truck className="w-6 h-6" />
          <span className="text-xs hidden sm:block">Track</span>
        </button>
        <button onClick={() => setCurrentPage('cart')} className="relative flex flex-col items-center text-gray-700 hover:text-[#E94458] transition">
          <ShoppingCart className="w-6 h-6" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#E94458] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
          <span className="text-xs hidden sm:block">Cart</span>
        </button>
        {/* Conditional Profile/Login Button */}
        {isLoggedIn ? (
          <button onClick={() => setCurrentPage('profile')} className="flex flex-col items-center text-gray-700 hover:text-[#E94458] transition">
            <User className="w-6 h-6" />
            <span className="text-xs hidden sm:block">Profile</span>
          </button>
        ) : (
          <button onClick={() => setCurrentPage('auth')} className="flex flex-col items-center text-gray-700 hover:text-[#E94458] transition">
            <LogIn className="w-6 h-6" />
            <span className="text-xs hidden sm:block">Login</span>
          </button>
        )}
      </nav>
    </div>
  </header>
);

// Footer component remains the same
const Footer = () => (
  <footer className="bg-gray-900 text-white mt-12">
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-lg font-bold mb-3 text-[#E94458]">Foodzy</h4>
          <p className="text-sm text-gray-400">Delivering happiness, one meal at a time.</p>
        </div>
        <div>
          <h4 className="text-lg font-bold mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#about" className="hover:text-[#E94458]">About Us</a></li>
            <li><a href="#careers" className="hover:text-[#E94458]">Careers</a></li>
            <li><a href="#press" className="hover:text-[#E94458]">Press</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-bold mb-3">Social Media</h4>
          <div className="flex space-x-3">
            {/* MKT311: Social Media Integration Links */}
            <a href="https://facebook.com/foodzy" target="_blank" rel="noopener noreferrer" className="hover:text-[#E94458]">FB</a>
            <a href="https://twitter.com/foodzy" target="_blank" rel="noopener noreferrer" className="hover:text-[#E94458]">TW</a>
            <a href="https://instagram.com/foodzy" target="_blank" rel="noopener noreferrer" className="hover:text-[#E94458]">IG</a>
          </div>
        </div>
        <div>
          {/* MKT311: Analytics Link Simulation for Report */}
          <h4 className="text-lg font-bold mb-3">Analytics Demo</h4>
          <button className="text-sm text-gray-400 hover:text-[#E94458] text-left" onClick={() => console.table(ANALYTICS_EVENTS)}>
            View Console Logs (Page Views, Clicks, Add to Cart)
          </button>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-500">
        &copy; 2025 Foodzy. All rights reserved. | Built with React for MKT311.
      </div>
    </div>
  </footer>
);

// MessageModal component remains the same
const MessageModal = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100 opacity-100">
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-[#E94458]">Notification</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>
            </div>
            <p className="mt-4 text-gray-700">{message}</p>
            <button
                onClick={onClose}
                className="mt-6 w-full px-4 py-2 bg-[#E94458] text-white font-semibold rounded-lg hover:bg-red-700 transition"
            >
                Close
            </button>
        </div>
      </div>
);

/**
 * GEMINI-POWERED CHATBOT MODAL (UI/UX UPDATED to match Foodzy theme)
 */
const ChatbotModal = ({ onClose, setModalMessage }) => {
    const [messages, setMessages] = useState([{ role: 'model', text: 'Hi there! I\'m Foodzy AI. I can help you decide what to eat, check for ingredients, or give quick food facts. What are you craving today?' }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (input.trim() === '' || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        
        // Add user message to chat history
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setIsLoading(true);
        trackAnalytics('chatbot_query', { query: userMessage.substring(0, 50) });

        try {
            const modelResponse = await geminiGenerateContent(userMessage);
            
            // Add model response to chat history
            setMessages(prev => [...prev, { role: 'model', text: modelResponse }]);

        } catch (e) {
            setModalMessage("Chat service failed to connect. Please try again later.");
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I lost connection to the server. Please check your network." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl flex flex-col w-full h-full max-w-lg max-h-[700px] transform transition-all scale-100 opacity-100" onClick={e => e.stopPropagation()}>
                
                {/* Header: Updated title/icon color to Foodzy primary */}
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center rounded-t-xl">
                    <h3 className="text-xl font-bold text-[#E94458] flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2 text-red-400"/>
                        Foodzy Chatbot
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                        <X size={24} />
                    </button>
                </div>
                
                {/* Message Area */}
                <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-white">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {/* User Bubble: Updated from bg-blue-500 to bg-[#E94458] */}
                            <div className={`max-w-[80%] px-4 py-2 rounded-xl text-sm shadow-md ${
                                msg.role === 'user' 
                                    ? 'bg-[#E94458] text-white rounded-br-none' 
                                    : 'bg-gray-200 text-gray-800 rounded-tl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-[80%] px-4 py-2 rounded-xl text-sm bg-gray-200 text-gray-800 rounded-tl-none flex items-center shadow-md">
                                {/* Loading Spinner: Updated color to text-[#E94458] */}
                                <Loader className="w-4 h-4 animate-spin mr-2 text-[#E94458]" />
                                Foodzy AI is typing...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 border-t bg-white flex space-x-2 rounded-b-xl">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me about food or diet..."
                        className="flex-grow p-3 border border-gray-300 rounded-full focus:ring-[#E94458] focus:border-[#E94458] transition"
                        disabled={isLoading}
                    />
                    {/* Send Button: Updated from bg-blue-500/600 to bg-[#E94458]/red-700 */}
                    <button
                        type="submit"
                        className="p-3 bg-[#E94458] text-white rounded-full hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};


// --- PAGE COMPONENTS ---

// Dish Card Component - RESTORED TO WHITE BACKGROUND AND SIMPLE STYLING
const DishCard = ({ dish, cart, setCart }) => {
    const dishRestaurant = MOCK_RESTAURANTS.find(r => r.id === dish.restaurantId);
    const quantity = cart.find(item => item.id === dish.id)?.quantity || 0;
    
    const handleAddToCart = () => {
        trackAnalytics('add_to_cart_home', { dish: dish.name, price: dish.price });
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === dish.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...dish, quantity: 1, restaurantName: dishRestaurant?.name || 'Unknown Restaurant' }];
        });
    };

    const handleRemoveFromCart = () => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === dish.id);
            if (existingItem && existingItem.quantity === 1) {
                return prevCart.filter(item => item.id !== dish.id);
            }
            return prevCart.map(item =>
                item.id === dish.id ? { ...item, quantity: item.quantity - 1 } : item
            );
        });
    };

    return (
        <div 
            // FIX: Added -my-1 margin to ensure scaling has room, and reduced scale factor.
            className="rounded-xl shadow-md transition-all duration-300 border border-gray-100 flex flex-col min-w-[200px] max-w-[200px] overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02] -my-1" 
            onClick={() => trackAnalytics('dish_card_click', { dish: dish.name })} 
        >
            <img
                src={dish.imgUrl.replace('100x100', '200x150')} 
                alt={dish.name}
                className="w-full h-36 object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/200x150/f0f9ff/3b82f6?text=${dish.name.split(' ')[0]}` }} 
            />
            {/* RESTORED: Content area back to white background */}
            <div className="p-3 flex flex-col flex-grow bg-white"> 
                <h4 className="text-md font-bold text-gray-900 truncate">{dish.name}</h4>
                <p className="text-xs text-gray-600 mb-2 truncate">{dishRestaurant ? dishRestaurant.name : 'Local Eatery'}</p>
                <div className="flex items-center justify-between mt-auto">
                    <span className="text-lg font-extrabold text-green-600">${dish.price.toFixed(2)}</span>
                    
                    {/* Add/Remove Buttons (simple styling, no pulse) */}
                    <div className="flex items-center space-x-1">
                        {quantity > 0 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRemoveFromCart(); }}
                                    className="p-1 border border-gray-300 text-gray-600 rounded-full hover:bg-gray-100 transition bg-white shadow-md"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="text-md font-semibold w-4 text-center">{quantity}</span>
                            </>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
                            className={`p-1 text-white rounded-full transition shadow-lg ${quantity > 0 ? 'bg-green-500 hover:bg-green-600' : 'bg-[#E94458] hover:bg-red-700'}`}
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const HomePage = ({ restaurants, setCurrentPage, setSelectedRestaurant, userId, setModalMessage, location, openChatbot, cart, setCart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const restaurantsRef = useRef(null);

  useEffect(() => {
    trackAnalytics('page_view', { page: 'home', userId });
    // MKT311: SEO - Inject Home Page Meta Description
    document.title = "Foodzy | Order Food Online - Fast Local Delivery";
    const metaDesc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    metaDesc.name = 'description';
    metaDesc.content = 'Foodzy offers the fastest food delivery online. Find the best biryani, pizza, and vegan food near you with our local restaurant discovery platform.';
    document.head.appendChild(metaDesc);
  }, [userId]);

  // Curate popular dishes to display on the home page (e.g., the first 8)
  const popularDishes = useMemo(() => MOCK_DISHES.slice(0, 8), []);

  const allCuisines = useMemo(() => ['All', ...new Set(restaurants.map(r => r.cuisine))], [restaurants]);
  
  // Custom list of popular categories for Quick Links
  // UPDATED: Using high-contrast, centered image placeholders to match the user's request, 
  // and keeping the filter values consistent with the cuisine names in MOCK_RESTAURANTS.
  const quickLinks = [
    // Matches "Pizzas"
    { name: 'Pizzas', icon: '🍕', filter: 'Italian', imageUrl: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_288,h_360/MERCHANDISING_BANNERS/IMAGES/MERCH/2024/7/2/6ef07bda-b707-48ea-9b14-2594071593d1_Pizzas.png' },
    // Matches "Burgers"
    { name: 'Burgers', icon: '🍔', filter: 'American', imageUrl: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_288,h_360/MERCHANDISING_BANNERS/IMAGES/MERCH/2024/7/2/8f508de7-e0ac-4ba8-b54d-def9db98959e_burger.png' },
    // Matches "Noodles"
    { name: 'Noodles', icon: '🍜', filter: 'Chinese', imageUrl: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_288,h_360/MERCHANDISING_BANNERS/IMAGES/MERCH/2024/7/2/6ef07bda-b707-48ea-9b14-2594071593d1_Noodles.png' }, 
    // Matches "Biryani" (The Curry House serves Rice & Biryani, but filter on 'Indian')
    { name: 'Biryani', icon: '🍚', filter: 'Indian', imageUrl: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_288,h_360/MERCHANDISING_BANNERS/IMAGES/MERCH/2024/7/2/6ef07bda-b707-48ea-9b14-2594071593d1_Biryani.png' },
    // Matches "Rolls" (Sushi Zen serves Rolls, but filter on 'Japanese')
    { name: 'Rolls', icon: '🍣', filter: 'Japanese', imageUrl: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_288,h_360/MERCHANDISING_BANNERS/IMAGES/MERCH/2024/7/17/58760e8e-324f-479e-88fa-31800120ea38_Rolls1.png' },
    // Matches "Cakes" (Filter on 'Dessert' cuisine for Donut Heaven/Pizza Planet Desserts)
    { name: 'Cakes', icon: '🍰', filter: 'Dessert', imageUrl: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_288,h_360/MERCHANDISING_BANNERS/IMAGES/MERCH/2024/7/2/8f508de7-e0ac-4ba8-b54d-def9db98959e_cake.png' },
    // Matches "Pasta"
    { name: 'Pasta', icon: '🍝', filter: 'Italian', imageUrl: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_288,h_360/MERCHANDISING_BANNERS/IMAGES/MERCH/2024/7/2/f1263395-5d4a-4775-95dc-80ab6f3bbd89_pasta.png' },
  ];

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilter === 'All' || r.cuisine === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [restaurants, searchTerm, activeFilter]);

  const handleRestaurantClick = (restaurant) => {
    trackAnalytics('restaurant_click', { id: restaurant.id, name: restaurant.name });
    setSelectedRestaurant(restaurant);
    setCurrentPage('menu');
  };
  
  const handleQuickLinkClick = (filter) => {
    // Toggling the filter: If the user clicks the active filter again, reset to 'All'.
    setActiveFilter(prevFilter => (prevFilter === filter ? 'All' : filter));
    trackAnalytics('quick_link_click', { category: filter });
    // Scroll to the restaurant listings after applying filter
    if (restaurantsRef.current) {
      restaurantsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start', offset: -100 });
    }
  };

  const regularRestaurants = filteredRestaurants.filter(r => r.id); 

  // Component for a single restaurant card - RESTORED TO WHITE BACKGROUND AND SIMPLE STYLING
  const RestaurantCard = ({ restaurant }) => {
    
    return (
        <div
            // FIX: Added -my-1 margin to ensure scaling has room, and reduced scale factor.
            className="rounded-xl shadow-md transition-all duration-300 border border-gray-100 flex flex-col group cursor-pointer overflow-hidden hover:shadow-lg hover:scale-[1.02] -my-1" 
            onClick={() => handleRestaurantClick(restaurant)}
        >
            <img
                // FIX: This image source now correctly points to the raw GitHub image content URL
                src={restaurant.imageUrl}
                alt={restaurant.name + ' restaurant image'}
                className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x200/cccccc/333333?text=Foodzy" }} // Fallback
            />
            {/* RESTORED: Content area back to white background */}
            <div className="p-4 flex-grow flex flex-col justify-between bg-white"> 
                <h3 className="text-2xl font-extrabold text-gray-900 truncate mb-1">{restaurant.name}</h3>
                <p className="text-sm text-[#E94458] font-semibold mb-3">{restaurant.cuisine}</p>
                
                <div className="flex justify-between items-center text-sm border-t pt-3 border-gray-200">
                    <span className="flex items-center text-green-600 font-bold text-lg">
                        <Star className="w-5 h-5 mr-1 fill-green-500 stroke-none" />
                        {restaurant.rating}
                    </span>
                    <span className="flex items-center text-gray-600 font-medium">
                        <Clock className="w-5 h-5 mr-1 text-gray-400" />
                        {restaurant.deliveryTime} min
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-3 text-gray-500">
                    <span>Free delivery over $20</span>
                </div>
            </div>
        </div>
    );
  };
  
  const DealCard = ({ deal }) => (
      <div 
          onClick={() => {
              const r = restaurants.find(r => r.id === deal.restaurantId);
              if (r) {
                  handleRestaurantClick(r);
              } else {
                  setModalMessage(`Restaurant not found for deal: ${deal.title}`);
              }
              trackAnalytics('deal_click', { deal: deal.title });
          }}
          // FIX: Added -my-1 margin to ensure scaling has room, and reduced scale factor.
          className={`relative p-5 rounded-xl shadow-xl min-w-[320px] cursor-pointer text-white transition transform hover:scale-[1.02] hover:shadow-2xl active:scale-[1.0] -my-1 ${deal.color}`}
      >
          <Percent className="w-8 h-8 absolute top-3 right-3 text-white/80 opacity-80" />
          <h4 className="text-2xl font-extrabold mb-1 drop-shadow-md">{deal.title}</h4>
          <p className="text-md font-medium">{deal.subtitle}</p>
          <span className="text-sm mt-3 inline-block font-bold border-b-2 border-white/50">ORDER NOW <ChevronRight className='inline w-4 h-4'/></span>
      </div>
  );
  
  // Custom Circular Cuisine Link Component - **FIXED FOCUS RING AND ACTIVE RING**
  const CuisineLink = ({ link, handleQuickLinkClick, activeFilter }) => (
      <button
          key={link.name}
          onClick={() => handleQuickLinkClick(link.filter)}
          // 1. Removed activeFilter related classes
          // 2. Added focus:outline-none to remove the browser's default outline on the button
          className={`flex flex-col items-center justify-start min-w-[112px] cursor-pointer group transition transform hover:scale-[1.05] active:scale-[0.98] focus:outline-none`}
      >
          {/* Image Container: Increased size from w-24 h-24 to w-28 h-28 */}
          <div 
              className={`w-28 h-28 rounded-full overflow-hidden bg-white flex items-center justify-center transition-all duration-300 p-1
                  ${activeFilter === link.filter 
                    ? '' // Removed permanent ring styling
                    : ''}
                  // ✅ FINAL FIX: Removed all ring/offset styling on focus for a clean click result
                  focus:ring-0 focus:ring-offset-0`} 
          >
              <img 
                  src={link.imageUrl} 
                  alt={link.name} 
                  // **FIXED CLIPPING:** Changed object-cover to object-contain
                  className="w-full h-full object-contain" 
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/112x112/ffffff/333333?text=${link.name.split(' ')[0]}` }}
              />
          </div>
          {/* REMOVED: Name span removed as requested by the user */}
      </button>
  );

  return (
    <div className="pt-0 pb-8 min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-7xl">
        
        {/* HIGH-LEVEL HERO SECTION WITH 3D ANIMATION */}
        {/* FIX: Set rounded-2xl to round ALL corners, ensuring the top corners are visible */}
        <div className="relative bg-[#FDD9DF] p-8 md:p-12 rounded-2xl shadow-2xl overflow-hidden"> 
            {/* 3D Animated Background Element */}
            <div className="hidden md:block absolute top-0 right-0 w-1/2 h-full opacity-60 pointer-events-none">
                <AnimatedFoodScene />
            </div>

            <div className="relative z-10 max-w-3xl py-10">
                <h2 className="text-5xl md:text-7xl font-extrabold mb-4 text-[#E94458] leading-tight drop-shadow-md">
                    Hot Food. <br/> Zero Wait.
                </h2>
                <p className="text-xl mb-8 font-medium text-gray-700">
                    Delivering the finest meals to <span className="font-bold underline text-gray-800">{location}</span>, faster than ever.
                </p>
                {/* Clean Search Bar - GLASS UI/UX APPLIED HERE */}
                <div className="bg-white/30 backdrop-blur-md p-4 rounded-full flex items-center shadow-2xl max-w-lg transition hover:shadow-red-300 border border-white/50">
                    <Search className="w-6 h-6 text-gray-800 mx-3 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Search for a dish, cuisine, or restaurant..."
                        className="w-full text-lg p-1 text-gray-900 bg-transparent placeholder-gray-500 focus:outline-none placeholder-light"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </div>
        
        {/* Dynamic Deals Carousel */}
        <div className="px-4">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center mt-12"> {/* Added mt-12 for space below Hero */}
                <Percent className="w-6 h-6 mr-2 text-yellow-600" />
                Top Daily Deals
            </h2>
        </div>
        
        {/* Fix for Card Clipping: Outer div with padding, inner div is scrollable, cards are slightly wider */}
        <div className="px-4 overflow-x-hidden -mx-4"> 
            {/* Added py-4 padding to ensure scaling has vertical room */}
            <div className="flex space-x-5 overflow-x-auto pb-6 scrollbar-hide mb-12 px-4 overflow-visible py-4"> 
                {MOCK_DAILY_DEALS.map(deal => (
                    <DealCard key={deal.id} deal={deal} />
                ))}
            </div>
        </div>

        {/* NEW SECTION: Popular Dishes for Quick Add to Cart - RESTORED TO WHITE */}
        <div className="px-4">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                <Heart className="w-6 h-6 mr-2 text-[#E94458] fill-[#E94458]" />
                Trending Dishes Near You
            </h2>
        </div>
        <div className="px-4 overflow-x-hidden -mx-4">
             {/* Added py-4 padding to ensure scaling has vertical room */}
            <div className="flex space-x-5 overflow-x-auto pb-6 scrollbar-hide mb-12 px-4 overflow-visible py-4">
                {popularDishes.map(dish => (
                    <DishCard key={dish.id} dish={dish} cart={cart} setCart={setCart} />
                ))}
            </div>
        </div>
        
        {/* Interactive Quick Links / Popular Categories - ENHANCED UI/UX - NOW A DISTINCT BLOCK (UPDATED) */}
        {/* Fixed vertical padding and background to be fully clean white */}
        <div className="bg-white py-10 mb-12 border-y border-gray-100">
            <div className="px-4 container mx-auto max-w-7xl">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Explore Top Cuisines</h2>
                
                {/* Adjusted spacing to be tight like the reference image */}
                <div className="flex space-x-4 overflow-x-auto pb-4 justify-start sm:justify-center px-2"> 
                    {quickLinks.map(link => (
                        <CuisineLink 
                            key={link.name}
                            link={link}
                            handleQuickLinkClick={handleQuickLinkClick}
                            activeFilter={activeFilter}
                        />
                    ))}
                </div>
            </div>
        </div>

        {/* Restaurant Listings Section - RESTORED TO WHITE */}
        <div ref={restaurantsRef} className="px-4">
            <h2 className="3xl font-extrabold text-gray-900 mb-6 border-b pb-2">
                {activeFilter === 'All' ? 'Restaurants Delivering Now' : `${activeFilter} Specialties`}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {regularRestaurants.length > 0 ? (
                regularRestaurants.map(restaurant => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)
              ) : (
                <div className="col-span-full text-center py-10 text-gray-500">
                  No restaurants match your search or filters.
                </div>
              )}
            </div>
        </div>
        
        {/* Floating Chatbot Button */}
        <button
            onClick={openChatbot}
            // Updated Chatbot button color from blue to Foodzy primary
            className="fixed bottom-12 right-12 z-40 p-4 bg-[#E94458] text-white rounded-full shadow-2xl hover:bg-red-700 transition transform hover:scale-110 active:scale-95"
            aria-label="Open AI Chatbot"
        >
            <MessageSquare className="w-6 h-6" />
        </button>

      </div>
    </div>
  );
};

// RestaurantMenuPage component - CORRECTED
const RestaurantMenuPage = ({ restaurant, setCurrentPage, cart, setCart, userId, setModalMessage }) => {
  // Use MOCK_DISHES array and filter by restaurantId
  const menu = useMemo(() => {
    return MOCK_DISHES.filter(dish => dish.restaurantId === restaurant.id);
  }, [restaurant.id]);

  useEffect(() => {
    trackAnalytics('page_view', { page: 'menu', restaurantId: restaurant.id, userId });
    // MKT311: SEO - Update Title and Meta for specific restaurant
    document.title = `${restaurant.name} Menu | Foodzy Delivery`;
    const metaDesc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    metaDesc.name = 'description';
    metaDesc.content = `View the full menu for ${restaurant.name}. Order ${restaurant.cuisine} food online now for fast delivery.`;
    document.head.appendChild(metaDesc);
  }, [restaurant, userId]);

  const handleAddToCart = (dish) => {
    trackAnalytics('add_to_cart', { dish: dish.name, price: dish.price, restaurant: restaurant.name });
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === dish.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...dish, quantity: 1, restaurantName: restaurant.name }];
    });
  };

  const getDishQuantity = (dishId) => {
    const item = cart.find(item => item.id === dishId);
    return item ? item.quantity : 0;
  };

  const handleRemoveFromCart = (dishId) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === dishId);
      if (existingItem.quantity === 1) {
        return prevCart.filter(item => item.id !== dishId);
      }
      return prevCart.map(item =>
        item.id === dishId ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };
  
  // Group dishes by category as requested
  const groupedMenu = useMemo(() => {
    return menu.reduce((acc, dish) => {
      acc[dish.category] = acc[dish.category] || [];
      acc[dish.category].push(dish);
      return acc;
    }, {});
  }, [menu]);

  return (
    <div className="pt-24 pb-8 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Restaurant Header */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <button onClick={() => setCurrentPage('home')} className="flex items-center text-gray-500 hover:text-[#E94458] mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Back to Restaurants
          </button>
          <div className="flex items-center space-x-4">
            <img
              // FIX APPLIED HERE: Using the direct, unmodified imageUrl from MOCK_RESTAURANTS
              src={restaurant.imageUrl} 
              alt={`${restaurant.name} logo`}
              className="w-20 h-20 object-cover rounded-full border-4 border-gray-200"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x80/cccccc/333333?text=Logo" }} // Fallback
            />
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">{restaurant.name}</h2>
              <p className="text-lg text-gray-600">{restaurant.cuisine}</p>
              <div className="flex items-center space-x-4 mt-1 text-sm">
                <span className="flex items-center text-green-600 font-semibold"><Star className="w-4 h-4 mr-1 fill-green-500 stroke-none" />{restaurant.rating}</span>
                <span className="flex items-center text-gray-600"><Clock className="w-4 h-4 mr-1" />{restaurant.deliveryTime} min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        {Object.entries(groupedMenu).map(([category, dishes]) => (
          <div key={category} className="mb-8">
            <h3 className="2xl font-bold text-gray-800 border-b-2 border-[#E94458] pb-2 mb-4">{category}</h3>
            <div className="space-y-4">
              {dishes.map(dish => {
                const quantity = getDishQuantity(dish.id);
                return (
                  <div key={dish.id} className="flex items-start justify-between bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition">
                    <div className="flex items-start space-x-4 flex-grow">
                      <img
                        src={dish.imgUrl} // Now using specific dish image URL
                        alt={dish.imgAlt || `${dish.name} image`} // MKT311: SEO Alt Text
                        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/80x80/cccccc/333333?text=${dish.name.split(' ')[0]}` }} // Fallback
                      />
                      <div className='flex-grow'>
                        <p className="text-lg font-semibold text-gray-900">{dish.name}</p>
                        <p className="text-sm text-gray-500 pr-4">{dish.desc}</p>
                        <p className="text-md font-bold text-[#E94458] mt-1">${dish.price.toFixed(2)}</p>
                      </div>
                    </div>
                    {/* Add/Remove buttons */}
                    <div className="flex flex-col items-center justify-center space-y-2 flex-shrink-0 ml-4">
                      <div className="flex items-center space-x-2">
                        {quantity > 0 && (
                          <>
                            <button
                              onClick={() => handleRemoveFromCart(dish.id)}
                              className="p-1 border border-[#E94458] text-[#E94458] rounded-full hover:bg-red-50 transition"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-lg font-semibold w-4 text-center">{quantity}</span>
                          </>
                        )}
                        <button
                          onClick={() => handleAddToCart(dish)}
                          className={`p-1 text-white rounded-full transition shadow-md ${quantity > 0 ? 'bg-green-500 hover:bg-green-600' : 'bg-[#E94458] hover:bg-red-700'}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

      </div>
       {/* Floating Cart CTA */}
       {cart.length > 0 && (
          <div className="fixed bottom-4 right-4 z-30">
            <button
              onClick={() => setCurrentPage('cart')}
              className="px-6 py-3 bg-green-500 text-white font-bold text-lg rounded-full shadow-2xl hover:bg-green-600 transition flex items-center space-x-2"
              aria-label="Proceed to checkout"
            >
              <ShoppingCart className="w-6 h-6" />
              <span>View Cart ({cart.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
            </button>
          </div>
        )}
    </div>
  );
};

// MODIFIED: CartPage component to handle editable address and "Use Current Location"
const CartPage = ({ cart, setCart, setCurrentPage, userId, setModalMessage, setActiveOrder, isLoggedIn, setPendingRedirect, currentDeliveryAddress, setCurrentDeliveryAddress, location }) => {

  useEffect(() => {
    trackAnalytics('page_view', { page: 'cart', userId });
    document.title = "Foodzy | Secure Checkout";
  }, [userId]);

  const deliveryFee = 5.00;
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal + deliveryFee;

const handleUpdateQuantity = (dishId, newQuantity) => {
if (newQuantity < 0) return;

setCart(prevCart => {
if (newQuantity === 0) {
return prevCart.filter(item => item.id !== dishId);
}
return prevCart.map(item =>
item.id === dishId ? { ...item, quantity: newQuantity } : item
);
});
};


const handlePlaceOrder = async () => {
if (cart.length === 0) {
setModalMessage("🛒 Your cart is empty!");
return;
}

// ✅ Order Placement Restriction and Redirection Setup
if (!isLoggedIn) {
    // Set pending redirect to cart, then go to auth page
    setPendingRedirect('cart'); 
    setModalMessage("Please log in or sign up to place your order!");
    setCurrentPage('auth'); 
    return; 
}

const deliveryAddress = currentDeliveryAddress; // ✅ USE DYNAMIC STATE
if (!deliveryAddress || deliveryAddress.trim() === '') {
    setModalMessage("Please enter a valid delivery address.");
    return;
}


try {
setModalMessage("⏳ Placing your order... Please wait a moment.");
console.log("🚀 Starting order placement...");

// Make sure db and userId exist
if (!db) throw new Error("Firestore is not initialized.");
// Check for a non-anonymous user ID before placing the order
if (!userId || auth.currentUser.isAnonymous) throw new Error("User must be signed in to place an order.");


// Determine restaurant name for tracking/display
const firstItem = cart[0];
const restaurantName = firstItem.restaurantName || MOCK_RESTAURANTS.find(r => r.id === firstItem.restaurantId)?.name || 'Unknown Eatery';

// Save order to the correct path for tracking
const orderId = new Date().getTime().toString();
const newOrderData = {
id: orderId,
userId,
items: cart.map(item => ({
id: item.id,
name: item.name,
price: item.price,
quantity: item.quantity,
restaurantName: item.restaurantName // Include restaurant name for display in tracking
})),
total: total.toFixed(2), // Use total, not just subtotal
status: "Confirmed",
createdAt: new Date(),
restaurantName: restaurantName, // Store main restaurant name if cart is from one place
deliveryAddress: deliveryAddress // ✅ NEW: Save the address used for the order
};

const orderRef = doc(db, `artifacts/${appId}/users/${userId}/orders`, orderId);

await setDoc(orderRef, newOrderData);

console.log("✅ Order saved in Firestore (tracking path)");

// Clear Firestore cart
const cartRef = doc(db, `artifacts/${appId}/users/${userId}/carts`, 'currentCart');
await setDoc(cartRef, { items: [] });
console.log("🗑️ Firestore cart cleared");

// Clear local cart
setCart([]);

// NEW: Manually set active order state in App for immediate tracking UI update
setActiveOrder(newOrderData);

// Success message & redirect to tracking
setModalMessage("✅ Your order has been placed successfully!");
setCurrentPage('tracking');

} catch (error) {
console.error("❌ Error placing order:", error);
setModalMessage(`❌ Failed to place order: ${error.message}`);
}
};

// ✅ NEW HANDLER: Use the current GPS location from the App's location state
const handleUseCurrentLocation = () => {
    setCurrentDeliveryAddress(location);
    setModalMessage(`Delivery address set to: ${location} (from GPS/Default)`);
};


  if (cart.length === 0) {
    return (
      <div className="pt-24 pb-8 min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="2xl font-bold text-gray-600">Your cart is empty!</h2>
        <p className="text-gray-500 mt-2">Time to find something delicious.</p>
        <button
          onClick={() => setCurrentPage('home')}
          className="mt-6 px-6 py-3 bg-[#E94458] text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition"
        >
          Start Ordering
        </button>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-8 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-8">Your Cart</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Cart Items List (2/3 width) */}
          <div className="md:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md border border-gray-100">
                <div className="flex items-center space-x-4">
                    <img
                        src={MOCK_DISHES.find(d => d.id === item.id)?.imgUrl || `https://placehold.co/60x60/4f46e5/ffffff?text=${item.name.split(' ')[0]}`}
                        alt={`Image of ${item.name}`}
                        className="w-16 h-16 object-cover rounded-md"
                    />
                    <div>
                        <p className="text-lg font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.restaurantName}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-2 text-gray-700 hover:bg-gray-100 rounded-l-lg"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 text-lg font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-2 text-gray-700 hover:bg-gray-100 rounded-r-lg"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-lg font-bold text-[#E94458] w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Card (1/3 width) */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-xl sticky top-28">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Order Summary</h3>

              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xl pt-4 border-t mt-4 border-dashed border-gray-300 text-gray-900">
                    <span>Total Payable:</span>
                    <span className="text-[#E94458]">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* ✅ NEW: Editable Address Field and Use Current Location Button */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-semibold mb-2 flex justify-between items-center">
                    <span>Delivery Address:</span>
                    <button 
                      onClick={handleUseCurrentLocation} 
                      className="text-xs text-blue-600 hover:underline flex items-center p-1 rounded-md hover:bg-blue-100 transition"
                    >
                      <MapPin className="w-3 h-3 mr-1"/> Use Current Location
                    </button>
                  </p>
                  <textarea
                      value={currentDeliveryAddress || ''}
                      onChange={(e) => setCurrentDeliveryAddress(e.target.value)}
                      rows="3"
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:border-[#E94458] focus:ring focus:ring-red-200 focus:ring-opacity-50 text-sm"
                      placeholder="Enter delivery address..."
                  />
              </div>

              <button
                onClick={handlePlaceOrder}
                className="mt-6 w-full px-6 py-3 bg-green-500 text-white font-extrabold text-lg rounded-lg shadow-xl hover:bg-green-600 transition transform hover:scale-[1.01]"
              >
                Place Order Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// OrderTrackingPage component remains the same
const OrderTrackingPage = ({ userId, setCurrentPage, setModalMessage, activeOrder: order, loading: appLoading }) => {
  // Local state for UI only
  const steps = ['Confirmed', 'Preparing', 'Quality Check', 'Out for Delivery', 'Delivered'];
  // Calculate statusIndex based on the global order state
  const statusIndex = order ? steps.indexOf(order.status) : -1;


// Array of icons corresponding to the steps
const stepIcons = [
<ClipboardCheck className="w-6 h-6" />, // Confirmed
<Cookie className="w-6 h-6" />, // Preparing
<ListOrdered className="w-6 h-6" />, // Quality Check
<Bike className="w-6 h-6" />, // Out for Delivery
<Check className="w-6 h-6" />, // Delivered
];

  // Old simulation/listener logic removed, only setup effect remains
  useEffect(() => {
    trackAnalytics('page_view', { page: 'tracking', userId });
    document.title = "Foodzy | Live Order Tracking";

    // Since the actual order update logic is now in App.jsx, this component only needs to mount and track analytics.
    // The status and loading are provided via props.
   
  }, [userId]);

  if (appLoading) {
    return (
      <div className="pt-24 pb-8 min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader className="w-12 h-12 text-[#E94458] animate-spin mb-4" />
        <p className="text-gray-600">Loading your recent order status...</p>
      </div>
    );
  }

  // NEW UI: No Active Orders
  if (!order || order.status === 'Delivered') {
    return (
      <div className="pt-24 pb-8 min-h-screen bg-white flex flex-col items-center justify-center">
        <Truck className="w-20 h-20 text-gray-300 mb-6" />
        <h2 className="text-3xl font-bold text-gray-800">No Active Orders</h2>
        <p className="text-gray-500 mt-2 text-center max-w-sm">
Looks like you're all set! Check your profile for past orders or start a new one now.
</p>
        <button
          onClick={() => setCurrentPage('home')}
          className="mt-8 px-6 py-3 bg-[#E94458] text-white font-bold rounded-lg shadow-xl hover:bg-red-700 transition transform hover:scale-[1.05]"
        >
          Start a New Order
        </button>
<button
          onClick={() => setCurrentPage('history')} // Direct link to dedicated history page
          className="mt-4 text-blue-600 hover:underline flex items-center"
        >
          <Archive className="w-4 h-4 mr-1"/> View Past Orders
        </button>
      </div>
    );
  }

  // Main tracking UI for active orders
  return (
    <div className="pt-24 pb-8 min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
           
            {/* 1. HEADER AND CURRENT STATUS ALERT */}
            <div className="bg-white p-6 rounded-xl shadow-2xl mb-8 border-t-4 border-[#E94458]">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center">
                    <Truck className="w-8 h-8 mr-3 text-[#E94458]" />
                    Live Order Tracking
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                    Order <span className="font-mono text-gray-800 font-semibold">#{order.id.substring(order.id.length - 8)}</span> from {order.items[0]?.restaurantName || 'Multiple Restaurants'}
                </p>
               
                {/* Current Stage Highlight */}
                <div className="w-full bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-lg flex items-center shadow-inner">
                  <Clock className="w-5 h-5 mr-3"/>
                  <p className="font-semibold">Current Stage: <span className="text-blue-700">{order.status}</span></p>
                </div>
            </div>

            {/* 2. PROGRESS BAR AND METRICS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               
                {/* Main Tracking and Driver Info (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                   
                    {/* Enhanced Status Timeline */}
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Delivery Progress</h3>

                        <div className="flex justify-between items-center relative py-6">
                            {/* Progress Bar Line */}
                            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
                            <div className="absolute top-1/2 left-0 h-1 bg-green-500 rounded-full transition-all duration-1000"
                                style={{ width: `${(statusIndex / (steps.length - 1)) * 100}%` }}>
                            </div>

                            {steps.map((step, index) => (
                                <div key={step} className="flex flex-col items-center relative z-10 w-1/5">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl
                                        ${index === statusIndex
? 'bg-[#E94458] text-white ring-4 ring-red-200 animate-smooth-pulse' // Pulsing color for current step
: index < statusIndex ? 'bg-green-500 text-white'
: 'bg-gray-200 text-gray-500'}`
                                    }>
                                        {stepIcons[index]}
                                    </div>
                                    <p className={`text-center mt-3 text-sm font-semibold transition-colors duration-500 w-full
                                        ${index === statusIndex ? 'text-[#E94458] font-extrabold' : index < statusIndex ? 'text-gray-900' : 'text-gray-500'}`
                                    }>
                                        {step}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Estimated Time and Driver Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center"><Clock className="w-5 h-5 mr-2 text-blue-500" /> Estimated Time</h3>
                            <p className="text-4xl font-extrabold text-[#E94458]">
                                {45 - statusIndex * 5} <span className='text-2xl font-semibold'>min</span>
                            </p>
                            <p className="text-sm text-gray-500 mt-2">Time updates live based on progress.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center"><User className="w-5 h-5 mr-2 text-blue-500" /> Driver: Alex S.</h3>
                            <p className="text-4xl font-extrabold text-gray-900">
                                (999) 555-FOOD
                            </p>
                            <button className="text-sm font-semibold text-blue-600 hover:underline mt-2 flex items-center">
                              Contact Driver <MessageCircle className='w-4 h-4 ml-1'/>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sticky Order Summary (1/3 width) */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-xl sticky top-28 border border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Order Details</h3>
                        <div className="space-y-3">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-gray-700 text-md">
                                    <span>{item.name} x {item.quantity}</span>
                                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between font-bold text-xl pt-4 border-t mt-4 border-dashed border-gray-300 text-gray-900">
                            <span>Total Paid:</span>
                            <span className="text-green-600">${parseFloat(order.total).toFixed(2)}</span>
                        </div>
                        <p className='text-sm text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg flex items-center'>
                            <MapPin className='w-4 h-4 mr-2'/> 
                            {/* ✅ FIX: Use the deliveryAddress saved in the order object */}
                            Delivering to: <span className="text-gray-700 font-medium ml-1 break-words">{order.deliveryAddress || 'Address Not Found'}</span>
                        </p>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
};


// NEW PAGE: Dedicated Order History Page
const OrderHistoryPage = ({ userId, setCurrentPage }) => {
const [orderHistory, setOrderHistory] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
if (!userId || !db) return;
trackAnalytics('page_view', { page: 'history', userId });
document.title = "Foodzy | Order History";

const ordersCollection = collection(db, `artifacts/${appId}/users/${userId}/orders`);
// Query for all orders to display a full history (Delivered or otherwise, although the main app focuses on Delivered)
const q = query(ordersCollection);

const unsubscribe = onSnapshot(q, (snapshot) => {
const history = [];
snapshot.forEach(doc => {
history.push({ id: doc.id, ...doc.data() });
});
// Sort by creation time, newest first (Firestore Timestamp check)
setOrderHistory(history.sort((a, b) => b.createdAt?.toDate?.() - a.createdAt?.toDate?.()));
setLoading(false);
});
return () => unsubscribe();
}, [userId, db]);

if (loading) {
return (
<div className="pt-24 pb-8 min-h-screen bg-gray-50 flex flex-col items-center justify-center">
<Loader className="w-12 h-12 text-[#E94458] animate-spin mb-4" />
<p className="text-gray-600">Loading your past orders...</p>
</div>
);
}


return (
<div className="pt-24 pb-8 min-h-screen bg-gray-50">
<div className="container mx-auto px-4 max-w-2xl">
<h2 className="text-4xl font-extrabold text-gray-900 mb-8 flex items-center">
<Archive className="w-8 h-8 mr-3 text-blue-600" />
My Order History
</h2>

{orderHistory.length === 0 ? (
<div className="bg-white p-8 rounded-xl shadow-lg text-center">
<ListOrdered className="w-12 h-12 text-gray-300 mx-auto mb-4" />
<p className="text-xl font-semibold text-gray-600">You haven't placed any orders yet.</p>
<button
onClick={() => setCurrentPage('home')}
className="mt-6 text-blue-600 hover:underline flex items-center mx-auto"
>
<Home className="w-4 h-4 mr-1"/> Go to Home Page
</button>
</div>
) : (
<div className="space-y-6">
{orderHistory.map(order => (
<div key={order.id} className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
<div className="flex justify-between items-start border-b pb-2 mb-2">
<span className="font-semibold text-gray-800 text-lg">Order #{order.id.substring(order.id.length-8)}</span>
<span className={`font-bold text-sm px-3 py-1 rounded-full ${
order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
}`}>
{order.status}
</span>
</div>
<div className="text-sm text-gray-600 mb-3">
<p>From: <span className="font-medium text-gray-800">{order.restaurantName || 'Unknown Eatery'}</span></p>
<p>Date: {order.createdAt?.toDate?.().toLocaleString?.() || 'N/A'}</p>
<p>Address: <span className="font-medium text-gray-800 break-words">{order.deliveryAddress || 'Address Not Found'}</span></p> {/* Display address from order */}
</div>
<div className="space-y-1 mt-2 text-sm">
{order.items?.map((item, idx) => (
<div key={idx} className="flex justify-between text-gray-700">
<span>{item.name} x {item.quantity}</span>
<span>${(item.price * item.quantity).toFixed(2)}</span>
</div>
))}
</div>
<div className="flex justify-between font-bold text-lg pt-3 border-t mt-3 text-gray-900">
<span>Total Paid:</span>
<span className="text-[#E94458]">${parseFloat(order.total).toFixed(2)}</span>
</div>
</div>
))}
</div>
)}
</div>
</div>
);
};


// ProfilePage component remains the same
const ProfilePage = ({ userId, setCurrentPage, setModalMessage, handleSignOut, userEmail, userName, userAddress, handleProfileSave, loading }) => {
// Mock user data for display (now handled by App state)
const [nameInput, setNameInput] = useState(userName || '');
const [addressInput, setAddress] = useState(userAddress || '456 Digital Marketing Lane, Jalandhar');

// Sync local state with props from App (on first load or external update)
useEffect(() => {
    setNameInput(userName || '');
    setAddress(userAddress || '456 Digital Marketing Lane, Jalandhar');
}, [userName, userAddress]);


    useEffect(() => {
        trackAnalytics('page_view', { page: 'profile', userId });
        document.title = "Foodzy | User Profile";
    }, [userId, userEmail]);

    const handleSave = () => {
        // Call the prop function provided by the App component
        handleProfileSave(nameInput, addressInput);
    };

    return (
<div className="pt-24 pb-8 min-h-screen bg-gray-50">
<div className="container mx-auto px-4 max-w-2xl">
<h2 className="text-4xl font-extrabold text-gray-900 mb-8 flex items-center">
<User className="w-8 h-8 mr-3 text-[#E94458]" />
My Profile
</h2>

<div className="bg-white p-8 rounded-xl shadow-xl space-y-6">
<div className="text-center pb-4 border-b border-gray-100">
<p className="text-sm text-gray-500">Authenticated User ID (for Firestore):</p>
<p className="font-mono text-xs break-all mt-1 bg-gray-100 p-2 rounded-lg">{userId}</p>
</div>

<h3 className="text-2xl font-bold text-gray-800">Account Details</h3>
<div className="space-y-4">
<label className="block">
<span className="text-gray-700 font-medium">Full Name</span>
<input
type="text"
value={nameInput}
onChange={(e) => setNameInput(e.target.value)}
className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:border-[#E94458] focus:ring focus:ring-red-200 focus:ring-opacity-50"
/>
</label>
<label className="block">
<span className="text-gray-700 font-medium">Email Address</span>
<input
type="email"
value={userEmail || 'N/A'}
readOnly
className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 bg-gray-100 cursor-not-allowed"
/>
</label>
</div>

<h3 className="2xl font-bold text-gray-800 pt-4 border-t">Delivery Information</h3>
<label className="block">
<span className="text-gray-700 font-medium">Default Delivery Address</span>
<textarea
value={addressInput}
onChange={(e) => setAddress(e.target.value)}
rows="3"
className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:border-[#E94458] focus:ring focus:ring-red-200 focus:ring-opacity-50"
/>
</label>

<button
onClick={handleSave}
disabled={loading}
className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 text-white font-extrabold text-lg rounded-lg shadow-xl hover:bg-green-600 transition transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
>
{loading ? <Loader className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
<span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
</button>

<div className="flex justify-between pt-4 border-t">
{/* UPDATED: Direct link to new dedicated history page */}
<button onClick={() => setCurrentPage('history')} className="text-blue-600 hover:underline flex items-center"><ListOrdered className="w-4 h-4 mr-1"/> Order History</button>
<button onClick={() => trackAnalytics('view_favorites')} className="text-pink-600 hover:underline flex items-center"><Heart className="w-4 h-4 mr-1"/> Favorites</button>
</div>

{/* Sign Out Button */}
<button
    onClick={handleSignOut}
    className="w-full text-center text-gray-500 hover:text-red-500 transition font-medium text-sm mt-4 border-t pt-4"
>
    Sign Out
</button>

</div>
</div>
</div>
    );
};

// ✅ NEW: AuthPage Component (MODIFIED to disable Google Sign-in)
const AuthPage = ({ setCurrentPage, setModalMessage }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        document.title = isLogin ? "Foodzy | Login" : "Foodzy | Sign Up";
        setError(null); // Clear error when switching mode
    }, [isLogin]);
    
    // Note: getErrorMessage is now defined in the global scope.

    // Email/Password Sign-in/Signup handler
    const handleAuth = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!email || !password) {
            setError("Email and password fields are required.");
            setLoading(false);
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                setModalMessage("✅ Welcome back! You are now logged in.");
                trackAnalytics('login', { method: 'email' });
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                setModalMessage("🎉 Account created successfully! Welcome to Foodzy.");
                trackAnalytics('signup', { method: 'email' });
            }
            // Success: onAuthStateChanged listener handles state update and redirection
        } catch (e) {
            setError(getErrorMessage(e.code));
            console.error("Auth error:", e);
        } finally {
            setLoading(false);
        }
    };

    // ❌ MODIFIED: Google Sign-in handler is now disabled and shows a modal message
    const handleGoogleAuthDisabled = () => {
        setModalMessage("🚧 Google Sign-in is currently undergoing maintenance. Feature coming soon! Please use Email/Password.");
        trackAnalytics('google_auth_disabled');
    };

    const isSubmitDisabled = loading || (!isLogin && password !== confirmPassword);

    return (
        <div className="pt-24 pb-8 min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl border-t-4 border-[#E94458] mx-4">
                <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
                    {isLogin ? 'Login to Foodzy' : 'Create an Account'}
                </h2>
                <p className="text-center text-gray-500 mb-8">
                    {isLogin ? 'Sign in to place your order and track delivery.' : 'Join the Foodzy community!'}
                </p>

                <form onSubmit={handleAuth} className="space-y-4">
                    {/* Error Display */}
                    {error && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start">
                            <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}
                    
                    {/* Email Field */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-[#E94458] focus:border-[#E94458] transition"
                        />
                    </div>

                    {/* Password Field */}
                    <div className="relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="password"
                            placeholder="Password (min 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-[#E94458] focus:border-[#E94458] transition"
                        />
                    </div>

                    {/* Confirm Password Field (Signup only) */}
                    {!isLogin && (
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-[#E94458] focus:border-[#E94458] transition ${password && password !== confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                            />
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitDisabled}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-[#E94458] text-white font-extrabold text-lg rounded-lg shadow-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading && <RefreshCw className="w-5 h-5 animate-spin" />}
                        {isLogin ? 
                            (loading ? 'Signing In...' : <><LogIn className="w-5 h-5" /> <span>Login Securely</span></>) : 
                            (loading ? 'Signing Up...' : <><UserPlus className="w-5 h-5" /> <span>Sign Up</span></>)
                        }
                    </button>
                </form>

                {/* Separator */}
                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/* ❌ MODIFIED: Google Sign-in Button now calls the disabled handler */}
                <button
                    onClick={handleGoogleAuthDisabled} // ❌ Call the new disabled handler
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 bg-white text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {/* FIX: Google Icon Visibility - Use the required Base64 image URL */}
                    <img 
                        src="src/assets/googlelogo.png" 
                        alt="Google logo" 
                        className="w-5 h-5" 
                    />
                    <span>Continue with Google</span>
                </button>
                
                {/* Switch Button */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-[#E94458] hover:underline transition"
                        disabled={loading}
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- MAIN APPLICATION COMPONENT ---

const App = () => {
  const [db, setDb] = useState(null);
  // NEW STATE: firebaseError to handle external connection failures
  const [firebaseError, setFirebaseError] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  // ✅ NEW: Explicit state to track if the user is *not* anonymous
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [cart, setCart] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurants, setRestaurants] = useState(MOCK_RESTAURANTS); // Initialize with mock data
  const [modalMessage, setModalMessage] = useState(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false); // New state for Chatbot
  const [location, setLocation] = useState('Jalandhar, Punjab'); // Location State
  const [userEmail, setUserEmail] = useState(null); // ✅ NEW: Store user email for profile
  const [userName, setUserName] = useState(null); // ✅ NEW: Store user display name for profile
  const [userAddress, setUserAddress] = useState(null); // ✅ NEW: Store user address for profile
  const [profileLoading, setProfileLoading] = useState(false); // ✅ NEW: Loading state for profile saving
  const [pendingRedirect, setPendingRedirect] = useState(null); // ✅ NEW: State for post-login redirection
  const [pageLoaded, setPageLoaded] = useState(false); // ✅ NEW: State to guard redirect logic

  // ✅ NEW STATE: Address used for current checkout/order
  const [currentDeliveryAddress, setCurrentDeliveryAddress] = useState('456 Digital Marketing Lane, Jalandhar');
  
  // NEW STATES for Global Order Tracking/Simulation
  const [activeOrder, setActiveOrder] = useState(null); // The full latest order object
  // REMOVED: hasNotifiedDelivery state is no longer needed since we use a Firestore flag
  const simulationIntervalRef = useRef(null);
  const steps = ['Confirmed', 'Preparing', 'Quality Check', 'Out for Delivery', 'Delivered'];


  // FIX: SCROLL TO TOP ON PAGE CHANGE (THE CRUCIAL FIX)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);
  
  // FIX: Moved the CDN injection logic inside the App component to correctly use useEffect.
  useEffect(() => {
    if (window.THREE) return;
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.onload = () => console.log("THREE.js loaded for 3D animation.");
    document.head.appendChild(script);
  }, []);

  // 1. Firebase Initialization and Authentication (FIXED onAuthStateChanged logic)
  useEffect(() => {
    // Suppress console spam from Firebase
    try { console.log = console.log.bind(console); } catch (e) { }

    let unsubscribeAuthState = () => {};
    
    try {
        const firestore = getFirestore(app);
        const authInstance = getAuth(app);
        setDb(firestore);
        setAuth(authInstance);
        setFirebaseError(null); // Clear any previous error
        
        // 🚀 FIX: Handle Google Redirect Result First 
        const handleRedirectAuth = async () => {
            try {
                // Must be called on page load to check if we came from a redirect
                const result = await getRedirectResult(authInstance);
                if (result) {
                    // This means a successful sign-in happened via redirect
                    console.log("✅ Auth Redirect Success:", result.user.email);
                    setModalMessage("✅ Signed in with Google! Enjoy your ordering.");
                    trackAnalytics('login', { method: 'google_redirect' });
                    // onAuthStateChanged will handle the final state change.
                }
            } catch (error) {
                // Handle errors from the redirect flow (e.g., user cancelled after redirect)
                console.error("Google Redirect Auth Error:", error);
                if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
                    setModalMessage(`❌ Google Sign-in failed: ${getErrorMessage(error.code)}`);
                }
            } finally {
                 // Attach the standard listener regardless of redirect success/failure
                unsubscribeAuthState = onAuthStateChanged(authInstance, async (user) => {
                    if (user) {
                        setUserId(user.uid);
                        
                        // ✅ Check if the user is a full (non-anonymous) login
                        const isUserLoggedIn = !user.isAnonymous && (user.email || user.displayName);
                        setIsLoggedIn(isUserLoggedIn);

                        if (isUserLoggedIn) {
                            // Set initial user details from Auth (will be overwritten by Firestore if available)
                            setUserEmail(user.email || 'N/A');
                            setUserName(user.displayName || 'User Foodzy');
                        } else {
                             setIsLoggedIn(false);
                        }
                    } else {
                        // User signed out. Force anonymous login for public access (restaurants/dishes)
                        try {
                            const anonUser = authInstance.currentUser;
                            if (!anonUser || !anonUser.isAnonymous) {
                                 await signInAnonymously(authInstance);
                                 // Note: The onAuthStateChanged will fire again with the new anon user.
                                 return;
                            }
                        } catch (e) {
                          console.error("Failed to sign in anonymously:", e);
                          setFirebaseError("Authentication failed. Please check your network.");
                        }
                        // Clear all user-specific states on sign out
                        setUserId(null);
                        setUserEmail(null);
                        setUserName(null);
                        setUserAddress(null);
                        setIsLoggedIn(false);
                        setCart([]);
                        setActiveOrder(null);
                      }
                      setLoading(false);
                });
            }
        };

        handleRedirectAuth(); // Run the new async function

        return () => unsubscribeAuthState(); // Return the cleanup function for the listener
    } catch (e) {
        console.error("Firebase initialization failed:", e);
        setFirebaseError("Failed to initialize core services. Please check your network connection (DNS/IP resolution error).");
        setLoading(false);
        return () => {}; // Return a no-op cleanup function
    }
  }, []); 

  // ✅ FIX: Separated Redirection Logic (Prevents infinite re-renders)
  useEffect(() => {
    // Wait for Firebase loading to finish
    if (loading) return; 
    
    setPageLoaded(true); // Mark app as ready for navigation

    const protectedPages = ['cart', 'tracking', 'profile', 'history'];
    
    // Logic 1: Handle post-login redirection
    if (isLoggedIn) {
        if (pendingRedirect) {
            const redirectTo = pendingRedirect;
            setPendingRedirect(null);
            setCurrentPage(redirectTo);
            return;
        } else if (currentPage === 'auth') {
            // Default redirect after successful login/auth page access
            setCurrentPage('home');
            return;
        }
    } 
    
    // Logic 2: Handle pre-login redirection (protected route block)
    else if (!isLoggedIn && protectedPages.includes(currentPage)) {
        // Set redirect target only if the user attempts to access cart or tracking
        if (currentPage === 'cart' || currentPage === 'tracking') {
             // Only set the state if it hasn't been set yet to avoid the infinite loop
             setPendingRedirect(prev => {
                if (prev !== currentPage) return currentPage;
                return prev;
             });
        }
        // Force redirect to Auth page
        setCurrentPage('auth');
    }
  }, [currentPage, isLoggedIn, loading, pendingRedirect]);


  // ✅ NEW: Firestore Listener for User Profile Data (Display Name & Address)
  useEffect(() => {
    if (!db || !userId || !isLoggedIn) {
        // FIX: Ensure currentDeliveryAddress is cleared/reset if user logs out or is anonymous
        setCurrentDeliveryAddress(location); // Fallback to current GPS/default location
        return; 
    }

    const userProfileDocRef = doc(db, `artifacts/${appId}/users/${userId}/profile`, 'details');

    // Listener for profile updates
    const unsubscribeProfile = onSnapshot(userProfileDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const profileData = docSnap.data();
            // Use Firestore data if available, otherwise fallback to Auth/default
            setUserName(profileData.displayName || auth.currentUser.displayName || 'User Foodzy');
            setUserAddress(profileData.address || '456 Digital Marketing Lane, Jalandhar');
        } else {
            // If profile document doesn't exist, create it with Auth data as fallback
            const initialProfile = {
                displayName: auth.currentUser.displayName || 'User Foodzy',
                address: '456 Digital Marketing Lane, Jalandhar',
                email: auth.currentUser.email || 'N/A',
                createdAt: new Date(),
            };
             setDoc(userProfileDocRef, initialProfile, { merge: true });
             setUserName(initialProfile.displayName);
             setUserAddress(initialProfile.address);
        }
    }, (error) => {
        console.error("Error fetching user profile:", error);
        setModalMessage("Failed to load user profile data.");
    });

    return () => unsubscribeProfile();
  }, [db, userId, isLoggedIn]); // Listen only when actively logged in

  // ✅ NEW EFFECT: Sync user's default address to current delivery address whenever userAddress or location changes
  useEffect(() => {
    if (isLoggedIn && userAddress) {
        setCurrentDeliveryAddress(userAddress);
    } else {
        // If not logged in, use the location state from the GPS selector
        setCurrentDeliveryAddress(location);
    }
  }, [isLoggedIn, userAddress, location]);
  
  // 2. Data Persistence (Restaurants and Cart)
  useEffect(() => {
    if (!db || !userId || firebaseError) return;

    // --- A. Public Restaurant Data Management ---
    const restaurantsColRef = collection(db, `artifacts/${appId}/public/data/restaurants`);

    // Check if initial data needs population
    const checkAndPopulateData = async () => {
        try {
            const snapshot = await getDocs(restaurantsColRef);
            if (snapshot.empty) {
                console.log("Populating initial restaurant data...");
                MOCK_RESTAURANTS.forEach(async (r) => {
                    await setDoc(doc(restaurantsColRef, r.id), r);
                });
            }
        } catch (e) {
            console.error("Error populating initial data:", e);
            setFirebaseError("Error syncing initial data. Please try refreshing.");
        }
    };
    checkAndPopulateData();

    // Listen for real-time changes to restaurant data
    const unsubscribeRestaurants = onSnapshot(restaurantsColRef, (snapshot) => {
        const fetchedRestaurants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Ensure we always have the mock data as a fallback if Firestore fails or is empty
        setRestaurants(fetchedRestaurants.length > 0 ? fetchedRestaurants : MOCK_RESTAURANTS);
    }, (error) => {
        console.error("Error fetching restaurants:", error);
        setFirebaseError("Real-time data synchronization failed. Check Firestore rules/connection.");
        setRestaurants(MOCK_RESTAURANTS); // Fallback to mock data if real-time listener fails
    });


    // --- B. Private Cart Data Management ---
    const cartDocRef = doc(db, `artifacts/${appId}/users/${userId}/carts`, 'currentCart');

    // 1. Listen for cart updates from Firestore
    const unsubscribeCart = onSnapshot(cartDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const storedCart = docSnap.data().items || [];
        setCart(storedCart);
      } else {
        // Initialize cart in Firestore if it doesn't exist
        setDoc(cartDocRef, { items: [] });
        setCart([]);
      }
    }, (error) => {
      console.error("Error fetching cart:", error);
      setModalMessage("Failed to load user cart data.");
    });

    return () => {
        unsubscribeRestaurants();
        unsubscribeCart();
    };

  }, [db, userId, firebaseError]);
  
  // 3. Save Cart to Firestore whenever 'cart' state changes
  useEffect(() => {
    if (!db || !userId || loading || firebaseError) return;

    const cartDocRef = doc(db, `artifacts/${appId}/users/${userId}/carts`, 'currentCart');
    // We only update if the cart has been loaded (cart.length is a proxy for readiness)
    const saveCart = async () => {
      try {
        await setDoc(cartDocRef, { items: cart });
        console.log("Cart saved to Firestore.");
      } catch (e) {
        console.error("Error saving cart:", e);
        // Do not set a global error here, as saving periodically fails due to network jitter
      }
    };
    saveCart();
  }, [cart, db, userId, loading, firebaseError]);
  
  // --- NEW GLOBAL TRACKING LOGIC ---

  // 4. Global Order Listener and Status Check (FIXED: Checks for Firestore flag)
  useEffect(() => {
    if (!db || !userId) return;

    const ordersCollection = collection(db, `artifacts/${appId}/users/${userId}/orders`);
    const q = query(ordersCollection);

    // This listener runs globally in App.jsx
    const unsubscribeOrders = onSnapshot(q, (snapshot) => {
        let latestOrder = null;
        snapshot.forEach(doc => {
            const orderData = doc.data();
            // Logic to find the absolute latest order by timestamp
            if (latestOrder === null) {
                latestOrder = { id: doc.id, ...orderData };
            } else if ((orderData.createdAt?.toDate?.() || new Date(0)) > (latestOrder.createdAt?.toDate?.() || new Date(0))) {
                latestOrder = { id: doc.id, ...orderData };
            }
        });

        // 1. If an order exists and is NOT delivered, set it as active.
        if (latestOrder && latestOrder.status !== 'Delivered') {
            setActiveOrder(latestOrder);
        } 
        
        // 2. If the latest order IS delivered, check the notification flag.
        else if (latestOrder && latestOrder.status === 'Delivered') {
            setActiveOrder(null); 
            
            // Notification logic: Only notify if the order is DELIVERED and the flag is FALSE/UNDEFINED
            if (!latestOrder.isDeliveryNotified) {
                
                // Show notification
                setModalMessage(`✅ Your order #${latestOrder.id.substring(latestOrder.id.length - 8)} has been delivered! Enjoy your meal.`);
                
                // Update Firestore to set the flag, preventing future pop-ups on refresh
                const orderRef = doc(db, `artifacts/${appId}/users/${userId}/orders`, latestOrder.id);
                setDoc(orderRef, { isDeliveryNotified: true }, { merge: true })
                   .then(() => console.log(`✅ Firestore notification flag set for order ${latestOrder.id}`))
                   .catch(e => console.error("Error setting notification flag:", e));
            }
        }
        
        // 3. If no orders are found at all, clear active order
        else {
             setActiveOrder(null);
        }
        
    }, (error) => {
        console.error("Error fetching global orders:", error);
        setFirebaseError("Failed to load global order status.");
    });
    
    return () => unsubscribeOrders();
  }, [db, userId]);


  // 5. Global Status Simulation Logic (Runs in Background)
  useEffect(() => {
    if (!db || !userId || !activeOrder) {
        // Clear interval if no active order or user is missing
        if (simulationIntervalRef.current) {
            clearInterval(simulationIntervalRef.current);
            simulationIntervalRef.current = null;
             console.log("[SIMULATION STOPPED] No active order.");
        }
        return;
    }
    
    // Clear any previous interval before starting a new one
    if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
    }

    // Start simulation interval
    console.log(`[SIMULATION STARTED] for Order #${activeOrder.id.substring(activeOrder.id.length - 8)}`);
    
    simulationIntervalRef.current = setInterval(() => {
        setActiveOrder(currentOrder => {
            if (!currentOrder || currentOrder.status === 'Delivered') {
                clearInterval(simulationIntervalRef.current);
                simulationIntervalRef.current = null;
                console.log("[SIMULATION STOPPED] Order delivered.");
                return null;
            }

            const currentStatusIndex = steps.indexOf(currentOrder.status);
            const nextStatusIndex = currentStatusIndex < steps.length - 1 ? currentStatusIndex + 1 : currentStatusIndex;
            const nextStatus = steps[nextStatusIndex];

            // Only update Firestore if status has actually advanced
            if (nextStatus !== currentOrder.status) {
                console.log(`[BACKGROUND SIMULATION] Order Status Advancing to: ${nextStatus}`);
               
                const orderRef = doc(db, `artifacts/${appId}/users/${userId}/orders`, currentOrder.id);
                // NOTE: We do not set isDeliveryNotified here. That's for the listener.
                setDoc(orderRef, { status: nextStatus }, { merge: true })
                    .catch(e => console.error("Error updating order status for simulation:", e));
            }
           
            // Update local state immediately for fast UI refresh
            return { ...currentOrder, status: nextStatus };
        });
    }, 10000); // Advances status every 10 seconds

    // Cleanup function
    return () => {
        if (simulationIntervalRef.current) {
            clearInterval(simulationIntervalRef.current);
            simulationIntervalRef.current = null;
            console.log("[SIMULATION CLEANUP] Interval cleared on component unmount/dependency change.");
        }
    };
  }, [db, userId, activeOrder?.id, activeOrder?.status]); // Re-run effect if a new active order is detected or status changes (for cleanup)
  
  // --- END NEW GLOBAL TRACKING LOGIC ---
  
  // ✅ NEW: Profile Update Handler
  const handleProfileSave = async (newName, newAddress) => {
    if (!auth.currentUser || !isLoggedIn) {
        setModalMessage("You must be logged in to save your profile.");
        return;
    }
    
    setProfileLoading(true);

    try {
        // 1. Update Firebase Auth Profile (Display Name)
        await updateProfile(auth.currentUser, {
            displayName: newName
        });
        
        // 2. Update Firestore Profile Document (Display Name and Address)
        const userProfileDocRef = doc(db, `artifacts/${appId}/users/${userId}/profile`, 'details');
        await setDoc(userProfileDocRef, {
            displayName: newName,
            address: newAddress,
            // Keep email constant on the document, but don't force Auth email update
        }, { merge: true });
        
        // Success: Local state will be updated by the Firestore listener (or we can force it)
        setUserName(newName);
        setUserAddress(newAddress);
        
        setModalMessage("✅ Profile saved successfully!");
        trackAnalytics('profile_update', { name: newName, address: newAddress });

    } catch (error) {
        console.error("Error saving profile:", error);
        setModalMessage(`❌ Failed to save profile: ${error.message}`);
    } finally {
        setProfileLoading(false);
    }
  };
  
  // ✅ NEW: Sign Out Handler
  const handleSignOut = async () => {
    try {
        await signOut(auth);
        setModalMessage("👋 You have been successfully signed out.");
        trackAnalytics('signout');
        setCurrentPage('home'); // Redirect to home page 
    } catch (e) {
        console.error("Sign out error:", e);
        setModalMessage(`❌ Sign out failed: ${e.message}`);
    }
  };


  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Render logic based on the current page state
  const renderPage = () => {
    
    // 1. If we are on the Auth page, render it. All redirection logic lives in useEffect.
    if (currentPage === 'auth') {
        return <AuthPage setCurrentPage={setCurrentPage} setModalMessage={setModalMessage} />;
    }

    // 2. Render the requested page normally.
    switch (currentPage) {
      case 'home':
        return <HomePage restaurants={restaurants} setCurrentPage={setCurrentPage} setSelectedRestaurant={setSelectedRestaurant} userId={userId} setModalMessage={setModalMessage} location={location} openChatbot={() => setIsChatbotOpen(true)} cart={cart} setCart={setCart} />;
      case 'menu':
        return selectedRestaurant ? (
          <RestaurantMenuPage restaurant={selectedRestaurant} setCurrentPage={setCurrentPage} cart={cart} setCart={setCart} userId={userId} setModalMessage={setModalMessage} />
        ) : (
          <div className="pt-24 text-center p-8">Restaurant not selected. <button onClick={() => setCurrentPage('home')} className="text-[#E94458]">Go Home</button></div>
        );
      case 'cart':
        // Pass isLoggedIn and setPendingRedirect for order placement check
        // ✅ PASS NEW ADDRESS PROPS
        return <CartPage cart={cart} setCart={setCart} setCurrentPage={setCurrentPage} userId={userId} setModalMessage={setModalMessage} setActiveOrder={setActiveOrder} isLoggedIn={isLoggedIn} setPendingRedirect={setPendingRedirect} 
          currentDeliveryAddress={currentDeliveryAddress}
          setCurrentDeliveryAddress={setCurrentDeliveryAddress}
          location={location}
        />;
      case 'tracking':
        // Pass the globally managed activeOrder and loading state
        return <OrderTrackingPage userId={userId} setCurrentPage={setCurrentPage} setModalMessage={setModalMessage} activeOrder={activeOrder} loading={loading} />;
      case 'profile': 
        // Pass profile data and save handler
        return <ProfilePage 
                    userId={userId} 
                    setCurrentPage={setCurrentPage} 
                    setModalMessage={setModalMessage} 
                    handleSignOut={handleSignOut} 
                    userEmail={userEmail} 
                    userName={userName}
                    userAddress={userAddress}
                    handleProfileSave={handleProfileSave}
                    loading={profileLoading} // Pass loading state
                />;
      case 'history':
        return <OrderHistoryPage userId={userId} setCurrentPage={setCurrentPage} />; // New page route
      default:
        return <HomePage restaurants={restaurants} setCurrentPage={setCurrentPage} setSelectedRestaurant={setSelectedRestaurant} userId={userId} setModalMessage={setModalMessage} location={location} openChatbot={() => setIsChatbotOpen(true)} cart={cart} setCart={setCart} />;
    }
  };
  
  // Custom Error Display Component for Fatal Firebase Errors
  const FatalErrorDisplay = () => (
    <div className="min-h-screen pt-24 bg-red-50 flex flex-col items-center justify-center text-center p-8">
        <CloudOff className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="3xl font-extrabold text-red-800 mb-2">Service Connection Failed</h2>
        <p className="text-lg text-red-700 mb-6">
            Foodzy relies on Firebase services which appear unreachable.
        </p>
        <div className="max-w-md bg-white p-4 rounded-lg shadow-md border border-red-200">
            <p className="font-semibold text-gray-800 mb-2">Error Details:</p>
            <p className="text-sm text-red-600 font-mono break-words">{firebaseError}</p>
        </div>
        <p className="mt-6 text-gray-600">Please check your network connection and try reloading the page.</p>
    </div>
  );


  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Corrected style block to use standard JSX and fix the boolean attribute warning */}
      <style>
        {`
          body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', sans-serif;
            /* Hide scrollbar for Deals Carousel, crucial for non-AI look */
            .scrollbar-hide {
                -ms-overflow-style: none;  /* IE and Edge */
                scrollbar-width: none;  /* Firefox */
            }
            .scrollbar-hide::-webkit-scrollbar {
                display: none;  /* Chrome, Safari and Opera */
            }

            /* Custom placeholder style for glass effect */
            .placeholder-light::placeholder {
                color: rgba(55, 65, 81, 0.7); /* text-gray-700 with some opacity */
            }
            
            /* Added animation CSS for pulse effect on tracking page */
            @keyframes smooth-pulse {
              0% { box-shadow: 0 0 0 0 rgba(233, 68, 88, 0.5); }
              70% { box-shadow: 0 0 0 10px rgba(233, 68, 88, 0); }
              100% { box-shadow: 0 0 0 0 rgba(233, 68, 88, 0); }
            }
            .animate-smooth-pulse {
              animation: smooth-pulse 2s infinite;
            }
        `}
      </style>

      <NavigationBar 
        setCurrentPage={setCurrentPage} 
        cartItemCount={cartItemCount} 
        location={location} 
        setLocation={setLocation} 
        setModalMessage={setModalMessage} 
        isLoggedIn={isLoggedIn} // ✅ NEW: Pass isLoggedIn prop
        setCurrentDeliveryAddress={setCurrentDeliveryAddress} // ✅ NEW PROP
      />
      
      {/* Collaborative User ID Banner - HIGHEST Z-INDEX below the Nav Bar */}
      {/* Set z-index to 30, higher than the Hero section's relative content (z-10) */}
      <div className="text-center p-2 bg-gray-200 text-xs text-gray-700 fixed top-[60px] left-0 right-0 z-30 shadow-inner">
          User ID for Collaboration: **{userId || 'Loading...'}**
          
      </div>

      {/* Main Content Area */}
      {/* The mt-[105px] now creates a visual gap below the fixed header and banner. */}
      <main className="flex-grow mt-[105px]"> 
        {firebaseError ? (
            <FatalErrorDisplay />
        ) : loading ? (
          <div className="min-h-screen flex flex-col items-center justify-center pt-24">
            <Loader className="w-12 h-12 text-[#E94458] animate-spin mb-4" />
            <p className="text-gray-600">Connecting to Foodzy backend...</p>
          </div>
        ) : (
            <>
                {/* Only render content if the page is ready, as determined by the guarded useEffect */}
                {pageLoaded ? renderPage() : (
                    <div className="min-h-screen flex flex-col items-center justify-center pt-24">
                        <Loader className="w-12 h-12 text-[#E94458] animate-spin mb-4" />
                        <p className="text-gray-600">Checking authentication...</p>
                    </div>
                )}
            </>
        )}
      </main>
      
      {/* Modal for Notifications (Alert replacement) */}
      {modalMessage && <MessageModal message={modalMessage} onClose={() => setModalMessage(null)} />}

      {/* AI Chatbot Modal */}
      {isChatbotOpen && (
          <ChatbotModal 
              onClose={() => setIsChatbotOpen(false)} 
              setModalMessage={setModalMessage}
          />
      )}

      <Footer />
    </div>
  );
};

export default App;
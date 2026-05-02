
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, limit } from 'firebase/firestore';

const PLACES = [
  {
    name: 'Manjarabad Fort',
    description: "A star-shaped fort built in 1792 by Tipu Sultan. Located at an altitude of 3,240 feet, this unique fort offers panoramic views of the Western Ghats and is enveloped in mist during the monsoon. The fort's geometric design is a marvel of Islamic architecture with French influences.",
    category: 'Heritage',
    images: [{ url: 'https://images.unsplash.com/photo-1623910397501-71fb3426e257?q=80&w=1200&auto=format&fit=crop', public_id: 'seed_manjarabad' }]
  },
  {
    name: 'Bisle Ghat Viewpoint',
    description: 'One of the most spectacular viewpoints in Karnataka, offering a breathtaking view of three mountain ranges - Pushpagiri, Kumaraparvatha and Kukke Subramanya. It is a heavenly place for nature lovers and photographers.',
    category: 'Nature',
    images: [{ url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop', public_id: 'seed_bisle' }]
  },
  {
    name: 'Magajahalli Waterfalls',
    description: 'Also known as Abbi Falls, this 20-foot tall waterfall is a popular picnic spot near Sakleshpur. The surrounding greenery and the gentle trickle of water make it a peaceful retreat for families and trekkers.',
    category: 'Waterfall',
    images: [{ url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop', public_id: 'seed_waterfall' }]
  }
];

const STAYS = [
  {
    name: 'Misty Woods Resort',
    description: 'Eco-luxury stay in a 100-acre coffee estate with traditional Kodava architecture. Experience ultimate tranquility and the aroma of fresh coffee beans.',
    priceRange: 'Premium',
    images: [{ url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop', public_id: 'seed_stay_1' }]
  },
  {
    name: 'Coffee Bean Retreat',
    description: 'A heritage bungalow from the 1800s, offering an authentic plantation experience with modern amenities and local delicacies.',
    priceRange: 'Mid-Range',
    images: [{ url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop', public_id: 'seed_stay_2' }]
  }
];

const FOOD_SPOTS = [
  {
    name: "Surabhi's Kitchen",
    description: 'Famous for authentic Malnad style South Indian Akki Rotti and spicy coconut chutney served in a traditional setting.',
    cuisine: 'Local',
    images: [{ url: 'https://images.unsplash.com/photo-1601050638917-3f3095c215bf?q=80&w=1200&auto=format&fit=crop', public_id: 'seed_food_1' }]
  }
];

export async function isDatabaseSeeded() {
  const q = query(collection(db, 'places'), limit(1));
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function seedInitialData() {
  const timestamp = serverTimestamp();

  // Seed Places
  for (const item of PLACES) {
    await addDoc(collection(db, 'places'), {
      ...item,
      createdAt: timestamp,
      updatedAt: timestamp
    });
  }

  // Seed Stays
  for (const item of STAYS) {
    await addDoc(collection(db, 'stays'), {
      ...item,
      createdAt: timestamp,
      updatedAt: timestamp
    });
  }

  // Seed Food Spots
  for (const item of FOOD_SPOTS) {
    await addDoc(collection(db, 'food_spots'), {
      ...item,
      createdAt: timestamp,
      updatedAt: timestamp
    });
  }
}

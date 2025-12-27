import React, {  useEffect, useState } from 'react';
import Card from '../Components/Card/ProductCard';
import { UserAuth } from '../Context/Auth';
import { ItemsContext } from '../Context/Item'; 




const MyAds = () => {
  const { items } = ItemsContext(); // full product list
  const { user } = UserAuth();      // logged-in user
  const [userItems, setUserItems] = useState([]);

  useEffect(() => {
    if (items && user) {
      const filtered = items.filter(item => item.userId === user.uid);
      setUserItems(filtered);
    }
  }, [items, user]);

  return (
    <div className="min-h-screen">
      <h2 className="text-2xl font-bold text-center mt-4">My Ads</h2>
      {userItems.length > 0 ? (
        <Card items={userItems} />
      ) : (
        <p className="text-center mt-10 text-gray-500">No ads found</p>
      )}
    </div>
  );
};

export default MyAds;
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { ItemsContext } from '../../Context/Item';
import { UserAuth } from '../../Context/Auth';
import { fireStore } from "../Firebase/Firebase";
import Sell from "../Modal/Sell"; // assuming modal component

const Details = () => {
  const { user } = UserAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { item } = location.state || {};

  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updatedItem, setUpdatedItem] = useState(item);

  const itemsCtx = ItemsContext();

  const isOwner = user && item && (
    (user.uid && item.userId && user.uid === item.userId) ||
    (user.email && item.userEmail && user.email === item.userEmail) ||
    (user.email && item.email && user.email === item.email)
  );

  const handleDelete = async () => {
    if (!user || !item) {
      alert('User or item information is missing');
      return;
    }

    if (!isOwner) {
      alert('You can only delete your own items');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this item? This action cannot be undone.');
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await itemsCtx.deleteItem(item.id);
      alert("Item deleted successfully");
      navigate('/');
    } catch (error) {
      console.error('Error deleting item', error);
      alert('Failed to delete item, try again');
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Refetch updated item after modal closes
  useEffect(() => {
    const fetchUpdatedItem = async () => {
      if (item?.id) {
        const docRef = doc(fireStore, "products", item.id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setUpdatedItem({ ...snapshot.data(), id: snapshot.id });
        }
      }
    };

    if (!showEditModal) {
      fetchUpdatedItem();
    }
  }, [showEditModal]);

  return (
    <>
      <div className="grid gap-0 sm:gap-5 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 p-10 px-5 sm:px-15 md:px-30 lg:px-40">
        <div className="border-2 w-full rounded-lg flex justify-center overflow-hidden h-96">
          <img className="object-cover" src={updatedItem?.imageUrl} alt={updatedItem?.title} />
        </div>

        <div className="flex flex-col relative w-full">
          <p className="p-1 pl-0 text-2xl font-bold">₹ {updatedItem?.price}</p>
          <p className="p-1 pl-0 text-base">{updatedItem?.category}</p>
          <p className="p-1 pl-0 text-xl font-bold">{updatedItem?.title}</p>
          <p className="p-1 pl-0 sm:pb-0 break-words text-ellipsis overflow-hidden w-full">
            {updatedItem?.description}
          </p>

          {isOwner && (
            <div className="mt-4 mb-4 flex gap-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
              >
                Edit Item
              </button>

              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDeleting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {isDeleting ? 'Deleting...' : 'Delete Item'}
              </button>
            </div>
          )}

          <div className="w-full relative sm:relative md:absolute bottom-0 flex justify-between">
            <p className="p-1 pl-0 font-bold">Seller: {updatedItem?.userName}</p>
            <p className="p-1 pl-0 text-sm">{updatedItem?.createdAt}</p>
          </div>
        </div>
      </div>

      {/* ✅ Modal for Editing */}
      {showEditModal && (
        <Sell
          status={showEditModal}
          toggleModalSell={() => setShowEditModal(false)}
          isEdit={true}
          editData={updatedItem}
          setItems={() => {}} // Optional if unused
        />
      )}
    </>
  );
};

export default Details;

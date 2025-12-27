import { Modal, ModalBody } from "flowbite-react";
import { useEffect, useState } from "react";
import Input from "../Input/Input";
import { UserAuth } from "../../Context/Auth";
import { addDoc, collection, doc, updateDoc ,getDoc} from "firebase/firestore";
import { fetchFromFirestore, fireStore } from "../Firebase/Firebase";
import fileUpload from "../../assets/fileUpload.svg";
import loading from "../../assets/loading.gif";
import close from "../../assets/close.svg";

const Sell = (props) => {
  const {
    toggleModalSell,
    status,
    setItems,
    isEdit = false,
    editData = null,
  } = props;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const auth = UserAuth();

  useEffect(() => {
    if (isEdit && editData) {
      setTitle(editData.title || "");
      setCategory(editData.category || "");
      setPrice(editData.price?.toString() || "");
      setDescription(editData.description || "");
      if (editData.imageUrl) {
        fetch(editData.imageUrl)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], "preview.jpg", { type: blob.type });
            setImage(file);
          });
      }
    }
  }, [isEdit, editData]);

  const [errors, setErrors] = useState({
    title: "",
    category: "",
    price: "",
    description: "",
    image: "",
  });

  const validateTitle = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "Title is required";
    if (trimmed.length < 3) return "Title must be at least 3 characters";
    if (trimmed.length > 100) return "Title must be less than 100 characters";
    return "";
  };

  const validateCategory = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "Category is required";
    if (trimmed.length < 2) return "Category must be at least 2 characters";
    if (trimmed.length > 50) return "Category must be less than 50 characters";
    return "";
  };

  const validatePrice = (value) => {
    const trimmed = value.trim();
    const num = parseFloat(trimmed);
    if (!trimmed) return "Price is required";
    if (isNaN(num)) return "Price must be a valid number";
    if (num <= 0) return "Price must be greater than 0";
    if (num > 10000000) return "Price must be less than 1 crore";
    if (trimmed.includes(".") && trimmed.split(".")[1].length > 2)
      return "Max 2 decimal places";
    return "";
  };

  const validateDescription = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "Description is required";
    if (trimmed.length < 10)
      return "Description must be at least 10 characters";
    if (trimmed.length > 1000)
      return "Description must be less than 1000 characters";
    return "";
  };

  const validateImage = (file) => {
    if (!file) return "Image is required";
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"];
    // if (!allowed.includes(file.type)) return "Invalid image type";
    if (file.size > 5 * 1024 * 1024) return "Image must be < 5MB";
    return "";
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "File must be an image" }));
      setImage(null);
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: "Image must be less than 1MB",
      }));
      setImage(null);
      return;
    }
    setErrors((prev) => ({ ...prev, image: "" }));
    setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth?.user) return alert("Please login");

    const imageError = validateImage(image);
    const titleError = validateTitle(title);
    const categoryError = validateCategory(category);
    const priceError = validatePrice(price);
    const descError = validateDescription(description);

    const newErrors = {
      title: titleError,
      category: categoryError,
      price: priceError,
      description: descError,
      image: imageError,
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((err) => err !== "");
    if (hasErrors) return alert("Please fix errors before submitting");

    setSubmitting(true);

    const readImageAsDataUrl = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

    let imageUrl = "";
    try {
      if (image) imageUrl = await readImageAsDataUrl(image);
    } catch (err) {
      console.error(err);
      alert("Failed to load image");
      setSubmitting(false);
      return;
    }

    try {
      if (isEdit && editData?.id) {
        const docRef = doc(fireStore, "products", editData.id);
        await updateDoc(docRef, {
          title: title.trim(),
          category: category.trim(),
          price: parseFloat(price.trim()),
          description: description.trim(),
          imageUrl,
          updatedAt: new Date().toISOString(),
        });
        alert("Item updated!");
      } else {
        await addDoc(collection(fireStore, "products"), {
          title: title.trim(),
          category: category.trim(),
          price: parseFloat(price.trim()),
          description: description.trim(),
          imageUrl,
          userId: auth.user.uid,
          userEmail: auth.user.email,
          userName: auth.user.displayName || "Anonymous",
          createdAt: new Date().toISOString(),
        });
        alert("Item listed!");
      }

      const updated = await fetchFromFirestore();
      setItems(updated);
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to save item");
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setTitle("");
    setCategory("");
    setPrice("");
    setDescription("");
    setImage(null);
    setErrors({
      title: "",
      category: "",
      price: "",
      description: "",
      image: "",
    });
    toggleModalSell();
  };

  const isFormValid =
    title.trim() &&
    category.trim() &&
    price.trim() &&
    description.trim() &&
    image &&
    !Object.values(errors).some((e) => e);

  return (
    <Modal
      theme={{
        content: {
          base: "relative w-full p-4 md:h-auto",
          inner:
            "relative flex max-h-[90dvh] flex-col rounded-lg bg-white shadow",
        },
      }}
      onClick={closeModal}
      show={status}
      className="bg-black bg-opacity-40"
      position={"center"}
      size="md"
      popup
    >
      <ModalBody
        className="bg-white h-auto max-h-[90vh] overflow-y-auto p-0 rounded-md"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          onClick={closeModal}
          className="w-6 absolute z-10 top-6 right-8 cursor-pointer"
          src={close}
          alt="Close"
        />

        <div className="p-6 pl-8 pr-8 pb-8">
          <p className="font-bold text-lg mb-3">
            {isEdit ? "Edit Item" : "Sell Item"}
          </p>

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="mb-4">
              <Input
                setInput={(val) => {
                  setTitle(val);
                  setErrors((prev) => ({
                    ...prev,
                    title: validateTitle(val),
                  }));
                }}
                placeholder="Title"
                value={title}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Category */}
            <div className="mb-4">
              <Input
                setInput={(val) => {
                  setCategory(val);
                  setErrors((prev) => ({
                    ...prev,
                    category: validateCategory(val),
                  }));
                }}
                placeholder="Category"
                value={category}
              />
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            {/* Price */}
            <div className="mb-4">
              <Input
                setInput={(val) => {
                  const sanitized = val.replace(/[^0-9.]/g, "");
                  setPrice(sanitized);
                  setErrors((prev) => ({
                    ...prev,
                    price: validatePrice(sanitized),
                  }));
                }}
                placeholder="Price (₹)"
                value={price}
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <Input
                setInput={(val) => {
                  setDescription(val);
                  setErrors((prev) => ({
                    ...prev,
                    description: validateDescription(val),
                  }));
                }}
                placeholder="Description"
                value={description}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                {description.length}/1000 characters
              </p>
            </div>

            {/* Image */}
            <div className="pt-2 w-full relative mb-4">
              {image ? (
                <div className="relative h-40 sm:h-60 w-full flex justify-center border-2 border-black rounded-md overflow-hidden">
                  <img
                    className="object-contain"
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setErrors((prev) => ({
                        ...prev,
                        image: "Image is required",
                      }));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="relative h-40 sm:h-60 w-full border-2 border-black rounded-md">
                  <input
                    onChange={handleImageUpload}
                    type="file"
                    className="absolute inset-0 h-full w-full opacity-0 cursor-pointer z-30"
                    accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <img className="w-12" src={fileUpload} alt="" />
                    <p className="text-center text-sm pt-2">
                      Click to upload images
                    </p>
                    <p className="text-center text-sm pt-1">
                      SVG, PNG, JPG (Max 5MB)
                    </p>
                  </div>
                </div>
              )}
              {errors.image && (
                <p className="text-red-500 text-sm mt-1">{errors.image}</p>
              )}
            </div>

            {/* Submit */}
            {submitting ? (
              <div className="w-full flex h-14 justify-center pt-4 pb-2">
                <img className="w-32 object-cover" src={loading} alt="" />
              </div>
            ) : (
              <div className="w-full pt-2">
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`w-full p-3 rounded-lg text-white transition-colors ${
                    isFormValid
                      ? "bg-[#002f34] hover:bg-[#001a1d]"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isEdit ? "Update Item" : "Sell Item"}
                </button>
              </div>
            )}
          </form>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default Sell;

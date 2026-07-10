"use client";
import { useState, useEffect } from "react";

export default function BookForm({ book, onSave, onCancel }) {
  // Initialize form state
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    isbn: "",
    author_id: "",
    new_author_name: "", // For adding new author
    new_author_biography: "", // For adding new author
    category_id: "",
    publisher_id: "",
    new_publisher_name: "", // For adding new publisher
    new_publisher_address: "", // For adding new publisher
    new_publisher_phone: "", // For adding new publisher
    new_publisher_email: "", // For adding new publisher
    publication_year: new Date().getFullYear(),
    edition: "",
    pages: "",
    language: "Indonesian",
    description: "",
    quantity: 1,
    rack_location: "",
    cover_image_url: "",
  });

  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [showNewAuthorForm, setShowNewAuthorForm] = useState(false);
  const [showNewPublisherForm, setShowNewPublisherForm] = useState(false);

  // Load initial data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all required data
        const [authorsRes, categoriesRes, publishersRes] = await Promise.all([
          fetch("/api/authors"),
          fetch("/api/categories"),
          fetch("/api/publishers")
        ]);

        const authorsData = await authorsRes.json();
        const categoriesData = await categoriesRes.json();
        const publishersData = await publishersRes.json();

        setAuthors(authorsData.data || []);
        setCategories(categoriesData.data || []);
        setPublishers(publishersData.data || []);

        // If editing, load book data
        if (book) {
          setFormData({
            title: book.title || "",
            subtitle: book.subtitle || "",
            isbn: book.isbn || "",
            author_id: book.author_id || "",
            new_author_name: "", // Reset new author fields
            new_author_biography: "",
            category_id: book.category_id || "",
            publisher_id: book.publisher_id || "",
            new_publisher_name: "", // Reset new publisher fields
            new_publisher_address: "",
            new_publisher_phone: "",
            new_publisher_email: "",
            publication_year: book.publication_year || new Date().getFullYear(),
            edition: book.edition || "",
            pages: book.pages || "",
            language: book.language || "Indonesian",
            description: book.description || "",
            quantity: book.quantity || 1,
            rack_location: book.rack_location || "",
            cover_image_url: book.cover_image_url || "",
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [book]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when field is changed
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ""
      });
    }
  };

  // Handle adding new author
  const handleAddNewAuthor = async () => {
    if (!formData.new_author_name.trim()) {
      setFormErrors({
        ...formErrors,
        new_author_name: "Author name is required"
      });
      return;
    }

    try {
      const response = await fetch("/api/authors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.new_author_name,
          biography: formData.new_author_biography,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the authors list
        const authorsRes = await fetch("/api/authors");
        const authorsData = await authorsRes.json();
        setAuthors(authorsData.data || []);

        // Set the new author as selected
        setFormData({
          ...formData,
          author_id: result.authorId,
          new_author_name: "",
          new_author_biography: "",
        });

        setShowNewAuthorForm(false);
        setFormErrors({ ...formErrors, new_author_name: "" });
      } else {
        setFormErrors({
          ...formErrors,
          new_author_name: result.message || "Error adding author"
        });
      }
    } catch (error) {
      setFormErrors({
        ...formErrors,
        new_author_name: error.message || "Error adding author"
      });
    }
  };

  // Handle adding new publisher
  const handleAddNewPublisher = async () => {
    if (!formData.new_publisher_name.trim()) {
      setFormErrors({
        ...formErrors,
        new_publisher_name: "Publisher name is required"
      });
      return;
    }

    try {
      const response = await fetch("/api/publishers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.new_publisher_name,
          address: formData.new_publisher_address,
          phone: formData.new_publisher_phone,
          email: formData.new_publisher_email,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the publishers list
        const publishersRes = await fetch("/api/publishers");
        const publishersData = await publishersRes.json();
        setPublishers(publishersData.data || []);

        // Set the new publisher as selected
        setFormData({
          ...formData,
          publisher_id: result.publisherId,
          new_publisher_name: "",
          new_publisher_address: "",
          new_publisher_phone: "",
          new_publisher_email: "",
        });

        setShowNewPublisherForm(false);
        setFormErrors({ ...formErrors, new_publisher_name: "" });
      } else {
        setFormErrors({
          ...formErrors,
          new_publisher_name: result.message || "Error adding publisher"
        });
      }
    } catch (error) {
      setFormErrors({
        ...formErrors,
        new_publisher_name: error.message || "Error adding publisher"
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    // Check if we have an author selected or if we're adding a new one
    if (!formData.author_id && !formData.new_author_name.trim()) {
      errors.author_id = "Author is required";
    }
    if (!formData.category_id) errors.category_id = "Category is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Prepare book data for submission
    let bookData = { ...formData };

    // If we have a new author to add
    if (formData.new_author_name.trim()) {
      try {
        const response = await fetch("/api/authors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.new_author_name,
            biography: formData.new_author_biography,
          }),
        });

        const result = await response.json();
        if (result.success) {
          bookData.author_id = result.authorId;
        } else {
          setFormErrors({
            ...formErrors,
            author_id: result.message || "Error adding author"
          });
          return;
        }
      } catch (error) {
        setFormErrors({
          ...formErrors,
          author_id: error.message || "Error adding author"
        });
        return;
      }
    }

    // If we have a new publisher to add
    if (formData.new_publisher_name.trim()) {
      try {
        const response = await fetch("/api/publishers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.new_publisher_name,
            address: formData.new_publisher_address,
            phone: formData.new_publisher_phone,
            email: formData.new_publisher_email,
          }),
        });

        const result = await response.json();
        if (result.success) {
          bookData.publisher_id = result.publisherId;
        } else {
          setFormErrors({
            ...formErrors,
            publisher_id: result.message || "Error adding publisher"
          });
          return;
        }
      } catch (error) {
        setFormErrors({
          ...formErrors,
          publisher_id: error.message || "Error adding publisher"
        });
        return;
      }
    }

    // Remove the new author/publisher form fields and file object from bookData to avoid conflicts
    delete bookData.new_author_name;
    delete bookData.new_author_biography;
    delete bookData.new_publisher_name;
    delete bookData.new_publisher_address;
    delete bookData.new_publisher_phone;
    delete bookData.new_publisher_email;
    delete bookData.cover_image_file;

    try {
      await onSave(bookData);
    } catch (error) {
      console.error("Error saving book:", error);
    }
  };

  // Handle image file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a temporary URL for the image preview
      const imageUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        cover_image_file: file,
        cover_image_url: imageUrl // For preview purposes
      });
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading form data...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg ${formErrors.title ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Book title"
          />
          {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subtitle
          </label>
          <input
            type="text"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Book subtitle (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ISBN
          </label>
          <input
            type="text"
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="ISBN (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Author *
          </label>
          <div className="flex space-x-2">
            <select
              name="author_id"
              value={formData.author_id}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${formErrors.author_id ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Author</option>
              {authors.map(author => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowNewAuthorForm(!showNewAuthorForm)}
              className="px-3 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              +
            </button>
          </div>
          {formErrors.author_id && <p className="text-red-500 text-xs mt-1">{formErrors.author_id}</p>}

          {showNewAuthorForm && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-700 mb-2">Add New Author</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author Name *
                  </label>
                  <input
                    type="text"
                    name="new_author_name"
                    value={formData.new_author_name}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg ${formErrors.new_author_name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Author name"
                  />
                  {formErrors.new_author_name && <p className="text-red-500 text-xs mt-1">{formErrors.new_author_name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biography
                  </label>
                  <textarea
                    name="new_author_biography"
                    value={formData.new_author_biography}
                    onChange={handleChange}
                    rows="2"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Author biography (optional)"
                  ></textarea>
                </div>
                <button
                  type="button"
                  onClick={handleAddNewAuthor}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
                >
                  Add Author
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg ${formErrors.category_id ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {formErrors.category_id && <p className="text-red-500 text-xs mt-1">{formErrors.category_id}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Publisher
          </label>
          <div className="flex space-x-2">
            <select
              name="publisher_id"
              value={formData.publisher_id}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Select Publisher</option>
              {publishers.map(publisher => (
                <option key={publisher.id} value={publisher.id}>
                  {publisher.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowNewPublisherForm(!showNewPublisherForm)}
              className="px-3 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              +
            </button>
          </div>

          {showNewPublisherForm && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-700 mb-2">Add New Publisher</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publisher Name *
                  </label>
                  <input
                    type="text"
                    name="new_publisher_name"
                    value={formData.new_publisher_name}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg ${formErrors.new_publisher_name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Publisher name"
                  />
                  {formErrors.new_publisher_name && <p className="text-red-500 text-xs mt-1">{formErrors.new_publisher_name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="new_publisher_address"
                    value={formData.new_publisher_address}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Publisher address (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="new_publisher_phone"
                    value={formData.new_publisher_phone}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Publisher phone (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="new_publisher_email"
                    value={formData.new_publisher_email}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Publisher email (optional)"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddNewPublisher}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
                >
                  Add Publisher
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Publication Year
          </label>
          <input
            type="number"
            name="publication_year"
            value={formData.publication_year}
            onChange={handleChange}
            min="1000"
            max={new Date().getFullYear() + 1}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Edition
          </label>
          <input
            type="text"
            name="edition"
            value={formData.edition}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="e.g., 2nd Edition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pages
          </label>
          <input
            type="number"
            name="pages"
            value={formData.pages}
            onChange={handleChange}
            min="1"
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Number of pages"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="Indonesian">Indonesian</option>
            <option value="English">English</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rack Location
          </label>
          <input
            type="text"
            name="rack_location"
            value={formData.rack_location}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="e.g., Shelf A-3"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cover Image
          </label>
          <div className="flex flex-col items-center">
            {formData.cover_image_url && !formData.cover_image_file && (
              <div className="mb-3">
                <img
                  src={formData.cover_image_url}
                  alt="Book cover preview"
                  className="w-32 h-40 object-cover border border-gray-300 rounded"
                />
              </div>
            )}
            {formData.cover_image_file && (
              <div className="mb-3">
                <img
                  src={URL.createObjectURL(formData.cover_image_file)}
                  alt="Book cover preview"
                  className="w-32 h-40 object-cover border border-gray-300 rounded"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Upload a book cover image (JPG, PNG, etc.)</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Book description"
          ></textarea>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          {book ? "Update Book" : "Add Book"}
        </button>
      </div>
    </form>
  );
}
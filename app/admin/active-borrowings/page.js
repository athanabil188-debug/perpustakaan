"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ActiveBorrowingsPage() {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [currentBorrowing, setCurrentBorrowing] = useState(null);
  const [returnFine, setReturnFine] = useState(0);

  // Fetch active borrowings
  useEffect(() => {
    const fetchBorrowings = async () => {
      try {
        const response = await fetch("/api/admin/active-borrowings");
        const data = await response.json();

        if (data.success) {
          setBorrowings(data.data || []);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowings();
  }, []);

  // Calculate days overdue
  const calculateDaysOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = Math.abs(today - due);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Only return positive number if it's actually overdue
    return today > due ? diffDays : 0;
  };

  // Filter borrowings based on search term
  const filteredBorrowings = borrowings.filter(borrowing => {
    const matchesSearch = searchTerm === "" ||
      (borrowing.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       borrowing.book_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       borrowing.librarian_name?.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  const handleReturn = async (borrowingId) => {
    try {
      const response = await fetch(`/api/admin/active-borrowings/${borrowingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "returned",
          fine_amount: parseFloat(returnFine) || 0,
          return_date: new Date().toISOString().split('T')[0]
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the borrowings list
        const updatedResponse = await fetch("/api/admin/active-borrowings");
        const updatedData = await updatedResponse.json();
        setBorrowings(updatedData.data || []);
        setShowReturnModal(false);
        setCurrentBorrowing(null);
        setReturnFine(0);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Error processing return: " + err.message);
    }
  };

  const openReturnModal = (borrowing) => {
    setCurrentBorrowing(borrowing);
    setShowReturnModal(true);
    // Default fine to 0 or calculate based on overdue days
    const daysOverdue = calculateDaysOverdue(borrowing.due_date);
    setReturnFine(daysOverdue > 0 ? (daysOverdue * 2000) : 0); // Assuming 2000 per day fine
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400 flex items-center justify-center">
        <div className="text-white text-xl">Loading active borrowings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400 p-6">
        <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Admin - Active Borrowings</h1>
            <div className="text-white">
              Active Borrowings: <span className="font-bold">{borrowings.length}</span>
            </div>
          </div>
        </div>

        {/* Search Control */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-4 mb-6">
          <input
            type="text"
            placeholder="Search borrowings by member name, book title, or librarian..."
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Active Borrowings Table */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Book</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Borrow Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Days Overdue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Librarian</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white bg-opacity-70 divide-y divide-gray-200">
              {filteredBorrowings.length > 0 ? (
                filteredBorrowings.map((borrowing) => {
                  const daysOverdue = calculateDaysOverdue(borrowing.due_date);
                  return (
                    <tr key={borrowing.id} className={`hover:bg-gray-50 ${daysOverdue > 0 ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {borrowing.member_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {borrowing.book_title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(borrowing.borrow_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(borrowing.due_date).toLocaleDateString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${daysOverdue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {daysOverdue > 0 ? `${daysOverdue} days` : 'On time'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${borrowing.status === 'borrowed' ? 'bg-blue-100 text-blue-800' :
                            borrowing.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          {borrowing.status.charAt(0).toUpperCase() + borrowing.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {borrowing.librarian_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openReturnModal(borrowing)}
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          Process Return
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    No active borrowings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Return Modal */}
        {showReturnModal && currentBorrowing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Process Book Return</h2>
                  <button
                    onClick={() => {
                      setShowReturnModal(false);
                      setCurrentBorrowing(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-4">
                  <p className="font-semibold">Member: {currentBorrowing.member_name}</p>
                  <p className="font-semibold">Book: {currentBorrowing.book_title}</p>
                  <p className="text-gray-600">Borrowed on: {new Date(currentBorrowing.borrow_date).toLocaleDateString()}</p>
                  <p className="text-gray-600">Due on: {new Date(currentBorrowing.due_date).toLocaleDateString()}</p>
                  
                  {calculateDaysOverdue(currentBorrowing.due_date) > 0 && (
                    <p className="text-red-600 font-semibold">
                      Days Overdue: {calculateDaysOverdue(currentBorrowing.due_date)}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fine Amount (Rp)
                  </label>
                  <input
                    type="number"
                    value={returnFine}
                    onChange={(e) => setReturnFine(e.target.value)}
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Calculated: {calculateDaysOverdue(currentBorrowing.due_date)} days overdue × 2000/day = {calculateDaysOverdue(currentBorrowing.due_date) * 2000}
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReturnModal(false);
                      setCurrentBorrowing(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReturn(currentBorrowing.id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
                  >
                    Confirm Return
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
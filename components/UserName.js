"use client";

import { useEffect, useRef, useState } from "react";

export default function UserName() {
  const [name, setName] = useState("");
  const [tempName, setTempName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  // Load name from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("adhd_user_name");
    if (stored) {
      setName(stored);
      setTempName(stored);
    } else {
      // first time default
      setName("");
      setTempName("");
      setIsEditing(true);
    }
  }, []);

  // Auto focus when editing
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Save name
  const handleSave = () => {
    if (!tempName.trim()) return;
    localStorage.setItem("adhd_user_name", tempName);
    setName(tempName);
    setIsEditing(false);
  };

  // Cancel edit
  const handleCancel = () => {
    setTempName(name);
    setIsEditing(false);
  };

  return (
    <div className="mb-4">
      {!isEditing ? (
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">
            {name ? `Good to see you, ${name} 👋` : "Welcome 👋"}
          </h2>

          {/* Edit button */}
          <button
            onClick={() => setIsEditing(true)}
            className="text-yellow-400 hover:scale-110 transition"
            title="Edit name"
          >
            ✏️
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            placeholder="Enter your name"
            className="px-3 py-1 rounded bg-gray-800 border border-gray-600 text-white"
          />

          <button
            onClick={handleSave}
            className="bg-yellow-400 text-black px-3 py-1 rounded hover:scale-105 transition"
          >
            Save
          </button>

          <button
            onClick={handleCancel}
            className="bg-gray-600 px-3 py-1 rounded hover:scale-105 transition"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

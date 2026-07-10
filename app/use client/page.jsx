"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("perpus_user"));
    setUser(data);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Profile Anda</h1>

      {user ? (
        <div className="mt-4 space-y-2">
          <p>
            <b>Nama:</b> {user.nama}
          </p>
          <p>
            <b>NISN:</b> {user.nisn}
          </p>
          <p>
            <b>Role:</b> {user.role}
          </p>
        </div>
      ) : (
        <p className="text-gray-500 mt-4">Memuat data...</p>
      )}
    </div>
  );
}

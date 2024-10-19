import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Button } from 'flowbite-react';
import toast from 'react-hot-toast';

function MessList() {
  const [messes, setMesses] = useState([]);
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    const fetchMesses = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/mess`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        setMesses(res.data.messes);
      } catch (error) {
        toast.error('Failed to fetch messes');
      }
    };

    fetchMesses();
  }, [currentUser.token]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/mess/${id}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      setMesses(messes.filter((mess) => mess.Mess_ID !== id));
      toast.success('Mess deleted successfully');
    } catch (error) {
      toast.error('Failed to delete mess');
    }
  };

  return (
    <div className="min-h-screen mt-20">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-semibold text-center mb-6">Manage Mess</h2>
        <ul>
          {messes.map((mess) => (
            <li key={mess.Mess_ID} className="mb-4 p-4 border rounded">
              <h3 className="text-xl font-bold">{mess.Mess_Name}</h3>
              <p>Mobile No: {mess.Mobile_No}</p>
              <p>Capacity: {mess.Capacity}</p>
              <p>Address: {mess.Address}</p>
              <p>Description: {mess.Description}</p>
              <p>Menu: {mess.Menu.join(', ')}</p>
              <Button color="failure" onClick={() => handleDelete(mess.Mess_ID)}>Delete</Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default MessList;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Label, TextInput, Textarea, Spinner } from 'flowbite-react';
import toast from 'react-hot-toast';

function MessForm() {
  const [formdata, setformdata] = useState({
    Mess_Name: '',
    Mobile_No: '',
    Capacity: '',
    Address: '',
    Description: '',
  });
  const [loading, setLoading] = useState(false); 
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    const fetchMessData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/mess/${currentUser._id}`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        if (res.data.success && res.data.mess) {
          setformdata(res.data.mess);
        }
      } catch (error) {
        // toast.error('Failed to fetch mess data');
      }
    };

    fetchMessData();
  }, [currentUser]);

  const handleChange = (e) => {
    setformdata({ ...formdata, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions
    setLoading(true); // Set loading to true
    try {
      let res;
      if (!formdata._id) {
        res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/mess/create/${currentUser._id}`, formdata, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        if (res.data.success) {
          toast.success('Mess profile created successfully');
        }
      } else {
        // Call update API
        res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/mess/update/${currentUser._id}`, formdata, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        if (res.data.success) {
          toast.success('Mess profile updated successfully');
        }
      }
    } catch (error) {
      toast.error('Failed to save mess profile');
    } finally {
      setTimeout(() => setLoading(false), 1000); // Set loading to false after 1 second
    }
  };

  return (
    <form className="w-80 flex flex-col gap-4 mb-10" onSubmit={handleSubmit}>
      <h2 className="text-2xl mx-auto font-bold mb-4 mt-2">Update Mess Information</h2>
      <div>
        <Label htmlFor="Mess_Name" value="Mess Name" />
        <TextInput id="Mess_Name" type="text" placeholder="Mess Name" value={formdata.Mess_Name} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="Mobile_No" value="Mobile Number" />
        <TextInput id="Mobile_No" type="text" placeholder="Mobile Number" value={formdata.Mobile_No} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="Capacity" value="Capacity" />
        <TextInput id="Capacity" type="text" placeholder="Capacity" value={formdata.Capacity} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="Address" value="Address" />
        <Textarea id="Address" placeholder="Address" value={formdata.Address} onChange={handleChange} required className='resize-none'/>
      </div>
      <div>
        <Label htmlFor="Description" value="Description" />
        <Textarea id="Description" placeholder="Description" value={formdata.Description} onChange={handleChange} className='resize-none'/>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Spinner size="sm" light={true} />
            <span className="ml-2">Saving...</span>
          </>
        ) : (
          'Save Profile'
        )}
      </Button>
     
    </form>
    
  );
}

export default MessForm;
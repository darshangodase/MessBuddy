import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Label, TextInput, Textarea } from 'flowbite-react';
import toast from 'react-hot-toast';

function MessForm() {
  const [formdata, setformdata] = useState({
    Mess_Name: '',
    Mobile_No: '',
    Capacity: '',
    Address: '',
    Description: '',
    Menu: '',
  });
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);

  const handleChange = (e) => {
    setformdata({ ...formdata, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/mess/create`, formdata, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      toast.success('Mess created successfully');
      navigate('/dashboard?tab=manage-mess');
    } catch (error) {
      toast.error('Failed to create mess');
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="Mess_Name" value="Mess Name" />
        <TextInput id="Mess_Name" type="text" placeholder="Mess Name" onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="Mobile_No" value="Mobile Number" />
        <TextInput id="Mobile_No" type="text" placeholder="Mobile Number" onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="Capacity" value="Capacity" />
        <TextInput id="Capacity" type="number" placeholder="Capacity" onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="Address" value="Address" />
        <Textarea id="Address" placeholder="Address" onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="Description" value="Description" />
        <Textarea id="Description" placeholder="Description" onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="Menu" value="Menu (comma separated)" />
        <Textarea id="Menu" placeholder="Menu" onChange={handleChange} />
      </div>
      <Button type="submit">Add Mess</Button>
    </form>
  );
}

export default MessForm;
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Button, Label, TextInput, Textarea, Spinner } from 'flowbite-react';
import uploadFile from '../helper/uploadFile';
import toast from 'react-hot-toast';

function MessForm() {
  const [formdata, setformdata] = useState({
    Mess_Name: '',
    Mobile_No: '',
    Capacity: '',
    Address: '',
    Description: '',
    Image: '', 
  });
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef(null); 
  const currentUser = useSelector((state) => state.user.currentUser);

  // Fetch existing mess data
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
        toast.error('Failed to fetch mess data');
      }
    };

    fetchMessData();
  }, [currentUser]);

  // Handle text input changes
  const handleChange = (e) => {
    setformdata({ ...formdata, [e.target.id]: e.target.value });
  };

  // Trigger file input click on image click
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  // Handle image upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadLoading(true);
    try {
      const uploadResult = await uploadFile(file);
      
      setformdata((prev) => ({
        ...prev,
        Image: uploadResult?.url, // Update Image URL
      }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formdata }; // Prepare the payload
      let res;
      if (!formdata._id) {
        // Create new mess profile
        res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/mess/create/${currentUser._id}`, payload, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        if (res.data.success) {
          toast.success('Mess profile created successfully');
        }
      } else {
        // Update existing mess profile
        res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/mess/update/${currentUser._id}`, payload, {
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
      setLoading(false);
    }
  };

  return (
    <form className="w-80 flex flex-col  gap-4 mb-6 font-rubik" onSubmit={handleSubmit}>
      <h2 className="text-2xl mx-auto font-bold mb-2 mt-2 font-poppins">Update Mess Information</h2>
      
      <div className="flex flex-col items-center ">
        <div
          className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border flex items-center justify-center cursor-pointer relative"
          onClick={handleImageClick}
        >
          {uploadLoading ? (
            <Spinner size="md" light={true} />
          ) : formdata.Image ? (
            <img
              src={formdata.Image}
              alt="Mess Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-500">Mess Profile</span>
          )}
        </div>
        {/* Hidden File Input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImageChange}
        />
      </div>

      {/* Form Fields */}
     <div className="text-lg">
      <div>
        <Label htmlFor="Mess_Name" value="Mess Name" className="text-base" />
        <TextInput id="Mess_Name" type="text" placeholder="Mess Name" value={formdata.Mess_Name} onChange={handleChange} required  />
      </div>
      <div>
        <Label htmlFor="Mobile_No" value="Mobile Number" className="text-base"/>
        <TextInput id="Mobile_No" type="text" placeholder="Mobile Number" value={formdata.Mobile_No} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="Capacity" value="Capacity" className="text-base" />
        <TextInput id="Capacity" type="number" placeholder="Capacity" value={formdata.Capacity} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="Address" value="Address" className="text-base"/>
        <Textarea id="Address" placeholder="Address" value={formdata.Address} onChange={handleChange} required className="resize-none" />
      </div>
      <div>
        <Label htmlFor="Description" value="Description" className="text-base" />
        <Textarea id="Description" placeholder="Description" value={formdata.Description} onChange={handleChange} className="resize-none" />
      </div>

      <div className="mt-4 flex items-center justify-center">
      <Button type="submit" disabled={loading || uploadLoading} className=''>
        {loading ? (
          <>
            <Spinner size="sm" light={true} />
            <span className="ml-2">Saving...</span>
          </>
        ) : (
          'Save Profile'
        )}
      </Button>
      </div>
    </div>
    </form>
  );
}

export default MessForm;

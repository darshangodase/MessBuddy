import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Button, Table, Modal, TextInput, Textarea, Label, Select } from 'flowbite-react';
import toast from 'react-hot-toast';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function Menu() {
  const [menus, setMenus] = useState([]);
  const [formdata, setFormdata] = useState({
    Menu_Name: '',
    Description: '',
    Price: '',
    Availability: 'Yes',
    Food_Type: 'Veg',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentMenuId, setCurrentMenuId] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    fetchMenus();
  }, [currentUser]);

  const fetchMenus = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/menu/${currentUser._id}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      if (res.data.success) {
        setMenus(res.data.menus);
      }
    } catch (error) {
      toast.error('Failed to fetch menus');
    } finally {
      setLoading(false); // Set loading to false when the request is complete
    }
  };

  const handleChange = (e) => {
    setFormdata({ ...formdata, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (isEdit) {
        res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/menu/update/${currentMenuId}`, formdata, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        if (res.data.success) {
          toast.success('Menu updated successfully');
        }
      } else {
        res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/menu/create/${currentUser._id}`, formdata, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        if (res.data.success) {
          toast.success('Menu created successfully');
        }
      }
      setIsModalOpen(false);
      setFormdata({ Menu_Name: '', Description: '', Price: '', Availability: 'Yes', Food_Type: 'Veg' });
      fetchMenus();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (menu) => {
    setFormdata(menu);
    setCurrentMenuId(menu._id);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (menuId) => {
    try {
      const res = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/menu/delete/${menuId}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      if (res.data.success) {
        toast.success('Menu deleted successfully');
        fetchMenus();
      }
    } catch (error) {
      toast.error('Failed to delete menu');
    }
  };

  const handleAvailabilityChange = async (menuId, availability) => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/menu/update/${menuId}`, { Availability: availability }, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      if (res.data.success) {
        toast.success('Availability updated successfully');
        fetchMenus();
      }
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const handleFoodTypeChange = async (menuId, foodType) => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/menu/update/${menuId}`, { Food_Type: foodType }, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      if (res.data.success) {
        toast.success('Food type updated successfully');
        fetchMenus();
      }
    } catch (error) {
      toast.error('Failed to update food type');
    }
  };

  const openModal = () => {
    setIsEdit(false);
    setFormdata({ Menu_Name: '', Description: '', Price: '', Availability: 'Yes', Food_Type: 'Veg' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className='h-full w-3/4'>
      <Button onClick={openModal} className='m-4'>Add Menu</Button>
      {loading ? ( // Show skeleton loader while data is loading
        <Table>
          <Table.Head className='animate-pulse'>
            <Table.HeadCell><Skeleton width={100}  /></Table.HeadCell>
            <Table.HeadCell><Skeleton width={200} /></Table.HeadCell>
            <Table.HeadCell><Skeleton width={50} /></Table.HeadCell>
            <Table.HeadCell><Skeleton width={80} /></Table.HeadCell>
            <Table.HeadCell><Skeleton width={80} /></Table.HeadCell>
            <Table.HeadCell><Skeleton width={100} /></Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {[...Array(5)].map((_, index) => ( // Create 5 skeleton rows
              <Table.Row key={index} className='animate-pulse'>
                <Table.Cell><Skeleton width={100} /></Table.Cell>
                <Table.Cell><Skeleton width={200} /></Table.Cell>
                <Table.Cell><Skeleton width={50} /></Table.Cell>
                <Table.Cell><Skeleton width={80} /></Table.Cell>
                <Table.Cell><Skeleton width={80} /></Table.Cell>
                <Table.Cell><Skeleton width={100} /></Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      ) : (
        <Table>
          <Table.Head>
            <Table.HeadCell>Menu Name</Table.HeadCell>
            <Table.HeadCell>Description</Table.HeadCell>
            <Table.HeadCell>Price</Table.HeadCell>
            <Table.HeadCell>Availability</Table.HeadCell>
            <Table.HeadCell>Food Type</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {menus.map((menu) => (
              <Table.Row key={menu._id}>
                <Table.Cell>{menu.Menu_Name}</Table.Cell>
                <Table.Cell>{menu.Description}</Table.Cell>
                <Table.Cell>{menu.Price}</Table.Cell>
                <Table.Cell>
                  <Select
                    id="Availability"
                    value={menu.Availability}
                    onChange={(e) => handleAvailabilityChange(menu._id, e.target.value)}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </Select>
                </Table.Cell>
                <Table.Cell>
                  <Select
                    id="Food_Type"
                    value={menu.Food_Type}
                    onChange={(e) => handleFoodTypeChange(menu._id, e.target.value)}
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </Select>
                </Table.Cell>
                <Table.Cell className='flex gap-2'>
                  <Button onClick={() => handleEdit(menu)}>Edit</Button>
                  <Button onClick={() => handleDelete(menu._id)}>Delete</Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <Modal show={isModalOpen} onClose={closeModal}>
        <Modal.Header>{isEdit ? 'Edit Menu' : 'Add Menu'}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="Menu_Name" value="Menu Name" />
              <TextInput id="Menu_Name" type="text" placeholder="Menu Name" value={formdata.Menu_Name} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="Description" value="Description" />
              <Textarea id="Description" placeholder="Description" value={formdata.Description} onChange={handleChange} required className='resize-none'/>
            </div>
            <div>
              <Label htmlFor="Price" value="Price" />
              <TextInput id="Price" type="number" placeholder="Price" value={formdata.Price} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="Availability" value="Availability" />
              <Select id="Availability" value={formdata.Availability} onChange={handleChange} required>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="Food_Type" value="Food Type" />
              <Select id="Food_Type" value={formdata.Food_Type} onChange={handleChange} required>
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
              </Select>
            </div>
            <Button type="submit" className='mt-5'>{isEdit ? 'Update Menu' : 'Add Menu'}</Button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Menu;

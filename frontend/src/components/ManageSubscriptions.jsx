import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Button, Card, TextInput, Select, Modal, Table, Textarea } from 'flowbite-react';
import toast from 'react-hot-toast';

function ManageSubscriptions() {
  const [plans, setPlans] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [allSubscribers, setAllSubscribers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [formData, setFormData] = useState({
    planName: '',
    duration: 'Daily',
    mealType: 'Veg',
    price: '',
    description: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);

  const currentUser = useSelector(state => state.user.currentUser);

  useEffect(() => {
    fetchPlans();
    fetchSubscribers();
  }, [currentUser]);

  const fetchPlans = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/subscriptions/mess/${currentUser._id}/plans`);
      setPlans(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch plans');
    }
  };

  const fetchSubscribers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/subscriptions/mess/${currentUser._id}/subscribers`);
      
      // Set all subscribers
      setAllSubscribers(res.data);
      
      // Filter active subscriptions
      const activeSubscriptions = res.data.filter(sub => sub.status === 'Active');
      setSubscribers(activeSubscriptions);
      
      // Calculate revenue from active subscriptions
      const revenue = activeSubscriptions.reduce((total, sub) => {
        return total + (sub.planId?.price || 0);
      }, 0);
      setTotalRevenue(revenue);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch subscribers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/subscriptions/plans/${editingPlan._id}`,
          { ...formData, userId: currentUser._id }
        );
        toast.success('Plan updated successfully');
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/subscriptions/plans`,
          { ...formData, userId: currentUser._id }
        );
        toast.success('Plan created successfully');
      }
      setShowModal(false);
      setEditingPlan(null);
      resetForm();
      fetchPlans();
    } catch (error) {
      console.error(error);
      toast.error(editingPlan ? 'Failed to update plan' : 'Failed to create plan');
    }
  };

  const handleDeleteClick = (plan) => {
    // Check if plan has active subscribers
    const activeSubscribers = subscribers.filter(sub => 
      sub.planId._id === plan._id && sub.status === 'Active'
    );
    
    if (activeSubscribers.length > 0) {
      const confirmMessage = `This plan has ${activeSubscribers.length} active subscriber${
        activeSubscribers.length === 1 ? '' : 's'
      }. Deleting this plan will cancel their subscriptions. Are you sure you want to proceed?`;
      
      toast((t) => (
        <div>
          <p>{confirmMessage}</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button size="sm" onClick={() => {
              setPlanToDelete(plan);
              setShowDeleteModal(true);
              toast.dismiss(t.id);
            }}>
              Yes, Delete
            </Button>
            <Button size="sm" color="gray" onClick={() => toast.dismiss(t.id)}>
              Cancel
            </Button>
          </div>
        </div>
      ), { duration: 6000 });
      return;
    }
    
    setPlanToDelete(plan);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/subscriptions/plans/${planToDelete._id}/${currentUser._id}`
      );
      toast.success('Plan deleted successfully');
      fetchPlans();
      setShowDeleteModal(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete plan');
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      planName: plan.planName,
      duration: plan.duration,
      mealType: plan.mealType,
      price: plan.price,
      description: plan.description
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      planName: '',
      duration: 'Daily',
      mealType: 'Veg',
      price: '',
      description: ''
    });
  };

  const handleStatusClick = (subscription) => {
    setSelectedSubscription(subscription);
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/subscriptions/${selectedSubscription._id}/activate`,
        { 
          status: newStatus,
          messId: currentUser._id 
        }
      );
      toast.success(`Subscription status updated to ${newStatus}`);
      fetchSubscribers();
      setShowStatusModal(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update subscription status');
    }
  };

  return (
    <div className="p-4 w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Subscription Plans</h2>
        <Button onClick={() => setShowModal(true)}>Add New Plan</Button>
      </div>

      {/* Revenue Summary */}
      <Card className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Revenue Summary</h3>
        <p className="text-2xl font-bold">₹{totalRevenue}</p>
        <p className="text-sm text-gray-600">Total earnings from subscriptions</p>
      </Card>

      {/* Plans Table */}
      <div className="mb-8 overflow-x-auto">
        <h3 className="text-xl font-semibold mb-4">Your Plans</h3>
        <Table>
          <Table.Head>
            <Table.HeadCell>Plan Name</Table.HeadCell>
            <Table.HeadCell>Duration</Table.HeadCell>
            <Table.HeadCell>Meal Type</Table.HeadCell>
            <Table.HeadCell>Price</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {plans.map((plan) => (
              <Table.Row key={plan._id}>
                <Table.Cell>{plan.planName}</Table.Cell>
                <Table.Cell>{plan.duration}</Table.Cell>
                <Table.Cell>{plan.mealType}</Table.Cell>
                <Table.Cell>₹{plan.price}</Table.Cell>
                <Table.Cell className="flex gap-2">
                  <Button size="sm" onClick={() => handleEdit(plan)}>Edit</Button>
                  <Button size="sm" color="failure" onClick={() => handleDeleteClick(plan)}>Delete</Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      {/* Active Subscribers Table */}
      <div className="mb-8 overflow-x-auto">
        <h3 className="text-xl font-semibold mb-4">Active Subscribers</h3>
        <Table>
          <Table.Head>
            <Table.HeadCell>User</Table.HeadCell>
            <Table.HeadCell>Email</Table.HeadCell>
            <Table.HeadCell>Plan</Table.HeadCell>
            <Table.HeadCell>Start Date</Table.HeadCell>
            <Table.HeadCell>End Date</Table.HeadCell>
            <Table.HeadCell>Amount</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {subscribers.map((sub) => (
              <Table.Row key={sub._id}>
                <Table.Cell>{sub.userId?.username}</Table.Cell>
                <Table.Cell>{sub.userId?.email}</Table.Cell>
                <Table.Cell>{sub.planId?.planName}</Table.Cell>
                <Table.Cell>{new Date(sub.startDate).toLocaleDateString()}</Table.Cell>
                <Table.Cell>{new Date(sub.endDate).toLocaleDateString()}</Table.Cell>
                <Table.Cell>₹{sub.planId?.price}</Table.Cell>
                <Table.Cell>
                  <span className={`px-2 py-1 rounded text-sm ${
                    sub.status === 'Active' ? 'bg-green-100 text-green-800' :
                    sub.status === 'Expired' ? 'bg-red-100 text-red-800' :
                    sub.status === 'Plan Removed' ? 'bg-orange-100 text-orange-800' :
                    sub.status === 'Cancelled' ? 'bg-yellow-100 text-yellow-800' :
                    sub.status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {sub.status}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <Button 
                    size="sm" 
                    onClick={() => handleStatusClick(sub)}
                  >
                    Change Status
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
            {subscribers.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={6} className="text-center py-4">
                  No active subscribers found
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>

      {/* All Subscribers Table */}
      <div className='mb-4 overflow-x-auto'>
        <h3 className="text-xl font-semibold mb-4">All Subscribers History</h3>
        <Table>
          <Table.Head>
            <Table.HeadCell>User</Table.HeadCell>
            <Table.HeadCell>Email</Table.HeadCell>
            <Table.HeadCell>Plan</Table.HeadCell>
            <Table.HeadCell>Start Date</Table.HeadCell>
            <Table.HeadCell>End Date</Table.HeadCell>
            <Table.HeadCell>Amount</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {allSubscribers.map((sub) => (
              <Table.Row key={sub._id}>
                <Table.Cell>{sub.userId?.username}</Table.Cell>
                <Table.Cell>{sub.userId?.email}</Table.Cell>
                <Table.Cell>{sub.planId?.planName}</Table.Cell>
                <Table.Cell>{new Date(sub.startDate).toLocaleDateString()}</Table.Cell>
                <Table.Cell>{new Date(sub.endDate).toLocaleDateString()}</Table.Cell>
                <Table.Cell>₹{sub.planId?.price}</Table.Cell>
                <Table.Cell>
                  <span className={`px-2 py-1 rounded text-sm ${
                    sub.status === 'Active' ? 'bg-green-100 text-green-800' :
                    sub.status === 'Expired' ? 'bg-red-100 text-red-800' :
                    sub.status === 'Plan Removed' ? 'bg-orange-100 text-orange-800' :
                    sub.status === 'Cancelled' ? 'bg-yellow-100 text-yellow-800' :
                    sub.status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {sub.status}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <Button 
                    size="sm" 
                    onClick={() => handleStatusClick(sub)}
                    disabled={sub.status === 'Plan Removed'}
                  >
                    Change Status
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
            {allSubscribers.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={8} className="text-center py-4">
                  No subscription history found
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>

      {/* Add/Edit Plan Modal */}
      <Modal show={showModal} onClose={() => {
        setShowModal(false);
        setEditingPlan(null);
        resetForm();
      }}>
        <Modal.Header>
          {editingPlan ? 'Edit Plan' : 'Add New Plan'}
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label>Plan Name</label>
              <TextInput
                value={formData.planName}
                onChange={(e) => setFormData({...formData, planName: e.target.value})}
                required
              />
            </div>
            <div>
              <label>Duration</label>
              <Select
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                required
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </Select>
            </div>
            <div>
              <label>Meal Type</label>
              <Select
                value={formData.mealType}
                onChange={(e) => setFormData({...formData, mealType: e.target.value})}
                required
              >
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Jain">Jain</option>
              </Select>
            </div>
            <div>
              <label>Price</label>
              <TextInput
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
            <div>
              <label>Description</label>
              <Textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                placeholder="Enter detailed plan description..."
                className="w-full"
              />
            </div>
            <Button type="submit">
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <Modal.Header>Confirm Delete</Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this plan?</p>
          <div className="flex justify-end gap-4 mt-4">
            <Button color="failure" onClick={handleDeleteConfirm}>
              Yes, Delete
            </Button>
            <Button color="gray" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Status Update Modal */}
      <Modal show={showStatusModal} onClose={() => setShowStatusModal(false)}>
        <Modal.Header>Update Subscription Status</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p>Update status for {selectedSubscription?.userId?.username}'s subscription</p>
            <p>Current Status: <span className="font-semibold">{selectedSubscription?.status}</span></p>
            <div className="flex flex-col gap-2">
              <Button 
                color={selectedSubscription?.status === 'Active' ? 'gray' : 'success'}
                onClick={() => handleStatusUpdate('Active')}
                disabled={selectedSubscription?.status === 'Active'}
              >
                Set as Active
              </Button>
              <Button 
                color="warning"
                onClick={() => handleStatusUpdate('Cancelled')}
                disabled={selectedSubscription?.status === 'Cancelled'}
              >
                Cancel Subscription
              </Button>
              <Button 
                color="failure"
                onClick={() => handleStatusUpdate('Expired')}
                disabled={selectedSubscription?.status === 'Expired'}
              >
                Mark as Expired
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default ManageSubscriptions; 
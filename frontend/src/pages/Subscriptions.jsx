import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Button, Card, TextInput, Select, Modal } from 'flowbite-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function Subscriptions() {
  const [plans, setPlans] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    duration: '',
    mealType: '',
    minPrice: '',
    maxPrice: ''
  });
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const currentUser = useSelector(state => state.user.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && currentUser.Login_Role !== 'User') {
      navigate('/');
      toast.error('Subscription feature is only available for users');
      return;
    }
    fetchPlans();
    if (currentUser) {
      fetchUserSubscriptions();
    }
  }, [currentUser]);

  const fetchPlans = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/subscriptions/plans`);
      setPlans(res.data);
    } catch (error) {
      console.log(error);
      toast.error('Failed to fetch subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubscriptions = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/subscriptions/user/${currentUser._id}`
      );
      setUserSubscriptions(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch your subscriptions');
    }
  };

  const handleSubscribeClick = async (plan) => {
    if (currentUser.Login_Role === 'Mess Owner') {
      toast.error('Mess owners cannot subscribe to plans');
      return;
    }

    // Check if user has ever subscribed to this plan
    const hasSubscribed = userSubscriptions.some(
      sub => sub.planId && sub.planId._id === plan._id
    );

    if (hasSubscribed) {
      toast.error('You have already subscribed to this plan before. Each plan can only be subscribed once.');
      return;
    }

    setSelectedPlan(plan);
    setShowSubscribeModal(true);
  };

  const handleSubscribeConfirm = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/subscriptions/subscribe`,
        { 
          planId: selectedPlan._id,
          userId: currentUser._id 
        }
      );

      const subscription = res.data;
      
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/subscriptions/${subscription._id}/activate`,
        { userId: currentUser._id }
      );

      toast.success('Successfully subscribed to plan');
      fetchUserSubscriptions();
      setShowSubscribeModal(false);
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        console.error(error);
        toast.error('Failed to subscribe to plan');
      }
      setShowSubscribeModal(false);
    }
  };
 

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredPlans = plans.filter(plan => {
    return (
      (!filters.duration || plan.duration === filters.duration) &&
      (!filters.mealType || plan.mealType === filters.mealType) &&
      (!filters.minPrice || plan.price >= filters.minPrice) &&
      (!filters.maxPrice || plan.price <= filters.maxPrice)
    );
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      case 'Plan Removed':
        return 'bg-orange-100 text-orange-800';
      case 'Cancelled':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 min-h-screen font-rubik">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Subscription Plans</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Select
            value={filters.duration}
            onChange={(e) => handleFilterChange('duration', e.target.value)}
          >
            <option value="">All Durations</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </Select>
          {/* Add more filters */}
        </div>

        {/* Available Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredPlans.length > 0 ? (
            filteredPlans.map((plan) => (
              <Card key={plan._id}>
                <h5 className="text-xl font-bold">{plan.planName}</h5>
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Mess:</span> {plan.messDetails?.Mess_Name}
                  </p>
                  <p className="text-gray-600 whitespace-pre-line">{plan.description}</p>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Duration:</span> {plan.duration}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Meal Type:</span> {plan.mealType}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Note:</span> You can subscribe to this plan only once
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Info:</span> You can subscribe to multiple plans from the same mess
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-lg font-semibold">₹{plan.price}</span>
                  <Button
                    onClick={() => handleSubscribeClick(plan)}
                    disabled={!currentUser}
                  >
                    Subscribe
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-xl text-gray-600">No subscription plans found for the selected filters.</p>
              <Button 
                className="mt-4"
                onClick={() => setFilters({
                  duration: '',
                  mealType: '',
                  minPrice: '',
                  maxPrice: ''
                })}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* User's Active Subscriptions */}
        {currentUser && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Your Subscriptions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userSubscriptions.map((sub) => (
                <Card key={sub._id}>
                  <div className="flex justify-between">
                    <div>
                      <h5 className="text-lg font-semibold">
                        {sub.planId ? sub.planId.planName : 'Plan No Longer Available'}
                      </h5>
                      <p className="text-sm text-gray-600">
                        Mess: {sub.planId?.messDetails?.Mess_Name || 'Not specified'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Valid till: {new Date(sub.endDate).toLocaleDateString()}
                      </p>
                      {!sub.planId && (
                        <p className="text-sm text-red-600">
                          {sub.status === 'Plan Removed' ? 
                            'This plan was removed by the mess owner' : 
                            'Plan is no longer available'
                          }
                        </p>
                      )}
                      {sub.cancellationReason && (
                        <p className="text-sm text-gray-600 mt-1">
                          Reason: {sub.cancellationReason}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-sm ${getStatusStyle(sub.status)}`}>
                        {sub.status}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
              {userSubscriptions.length === 0 && (
                <div className="col-span-2 text-center py-8">
                  <p className="text-gray-600">You don't have any subscriptions yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <Modal show={showSubscribeModal} onClose={() => setShowSubscribeModal(false)}>
          <Modal.Header>Confirm Subscription</Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{selectedPlan?.planName}</h3>
              <p className="text-sm text-gray-600">
                Mess: {selectedPlan?.messDetails?.Mess_Name}
              </p>
              <p>Price: ₹{selectedPlan?.price}</p>
              <p>Duration: {selectedPlan?.duration}</p>
              <p>Meal Type: {selectedPlan?.mealType}</p>
              <div className="flex justify-end gap-4 mt-4">
                <Button onClick={handleSubscribeConfirm}>
                  Proceed to Payment
                </Button>
                <Button color="gray" onClick={() => setShowSubscribeModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

export default Subscriptions; 
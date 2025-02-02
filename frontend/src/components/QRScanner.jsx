import { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { Button, Modal, Select, Card } from 'flowbite-react';
import { HiCamera, HiUpload } from 'react-icons/hi';

export default function QRScanner() {
  const [html5Qrcode, setHtml5Qrcode] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('');
  const [scannedData, setScannedData] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [scanMethod, setScanMethod] = useState('camera'); // 'camera' or 'upload'
  const { currentUser } = useSelector(state => state.user);

  useEffect(() => {
    if (scanMethod === 'camera') {
      const html5QrCode = new Html5Qrcode("reader");
      setHtml5Qrcode(html5QrCode);

      // Get list of cameras
      Html5Qrcode.getCameras()
        .then(devices => {
          if (devices && devices.length) {
            setCameras(devices);
            setSelectedCamera(devices[0].id);
          }
        })
        .catch(err => {
          console.error('Error getting cameras', err);
          toast.error('Unable to access camera');
        });

      return () => {
        if (html5QrCode.isScanning) {
          html5QrCode.stop().catch(err => console.error('Error stopping scanner', err));
        }
        html5QrCode.clear();
      };
    }
  }, [scanMethod]);

  const handleSwitchMethod = (method) => {
    if (html5Qrcode?.isScanning) {
      html5Qrcode.stop().catch(err => console.error('Error stopping scanner', err));
    }
    setScanMethod(method);
  };

  const startScanning = async () => {
    if (!selectedCamera || !html5Qrcode) return;

    try {
      await html5Qrcode.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        handleQrCode,
        (errorMessage) => {
          // Ignore error messages during scanning
        }
      );
    } catch (err) {
      console.error('Error starting scanner:', err);
      toast.error('Failed to start scanner');
    }
  };

  const stopScanning = async () => {
    if (html5Qrcode?.isScanning) {
      await html5Qrcode.stop();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode("reader-upload");
      const result = await html5QrCode.scanFile(file, true);
      await handleQrCode(result);
      html5QrCode.clear();
    } catch (error) {
      toast.error('Failed to read QR code from image');
    }
  };

  const handleQrCode = async (decodedText) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/mealpass/validate/${currentUser._id}`,
        { qrCode: decodedText }
      );
      
      if (response.data.valid) {
        if (html5Qrcode?.isScanning) {
          html5Qrcode.pause();
        }
        setScannedData(response.data);
        setShowModal(true);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid QR code';
      toast.error(errorMessage);
      
      // If using camera, resume scanning after error
      if (scanMethod === 'camera' && html5Qrcode) {
        setTimeout(() => {
          html5Qrcode.resume();
        }, 2000);
      }
    }
  };

  const handleMealSelection = async () => {
    if (!selectedMeal) {
      toast.error('Please select a meal type');
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkin/${currentUser._id}`,
        {
          mealPassId: scannedData.mealPass._id,
          mealType: selectedMeal
        }
      );

      toast.success(`Attendance marked for ${selectedMeal}`);
      setShowModal(false);
      setSelectedMeal('');
      setScannedData(null);
      
      // Resume scanning if using camera
      if (scanMethod === 'camera' && html5Qrcode) {
        startScanning();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 font-rubik">
      <div className="flex gap-2 mb-4 flex-wrap">
        <Button
          color={scanMethod === 'camera' ? 'blue' : 'gray'}
          onClick={() => handleSwitchMethod('camera')}
        >
          <HiCamera className="mr-2 h-5 w-5" />
          Camera
        </Button>
        <Button
          color={scanMethod === 'upload' ? 'blue' : 'gray'}
          onClick={() => handleSwitchMethod('upload')}
        >
          <HiUpload className="mr-2 h-5 w-5" />
          Upload Image
        </Button>
      </div>

      {scanMethod === 'camera' ? (
        <Card>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Scan with Camera</h2>
            
            {cameras.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Camera
                </label>
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                >
                  {cameras.map((camera) => (
                    <option key={camera.id} value={camera.id}>
                      {camera.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4">
              <Button
                onClick={html5Qrcode?.isScanning ? stopScanning : startScanning}
                className="w-full"
              >
                {html5Qrcode?.isScanning ? 'Stop Scanning' : 'Start Scanning'}
              </Button>
            </div>

            <div id="reader" className="w-full"></div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Upload QR Code</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <HiUpload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG (MAX. 800x800px)
                    </p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>
            {/* Hidden element for file scanning */}
            <div id="reader-upload" className="hidden"></div>
          </div>
        </Card>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>Mark Attendance</Modal.Header>
        <Modal.Body>
          {scannedData && (
            <div className="space-y-4">
              <div>
                <p><strong>Student:</strong> {scannedData.mealPass.userId.username}</p>
                <p><strong>Plan:</strong> {scannedData.mealPass.subscriptionId.planId.planName}</p>
                <p><strong>Valid till:</strong> {new Date(scannedData.mealPass.validTill).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block mb-2">Select Meal Type</label>
                <Select value={selectedMeal} onChange={(e) => setSelectedMeal(e.target.value)}>
                  <option value="">Select meal type</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                </Select>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleMealSelection}>Mark Attendance</Button>
          <Button color="gray" onClick={() => {
            setShowModal(false);
            if (scanMethod === 'camera' && html5Qrcode) {
              startScanning();
            }
          }}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
} 
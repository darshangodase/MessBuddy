import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Card, Button } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { HiDownload } from 'react-icons/hi';

export default function MealPass() {
  const [mealPasses, setMealPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useSelector(state => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMealPasses = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/mealpass/current/${currentUser._id}`
        );
        setMealPasses(res.data);
      } catch (error) {
        console.error('Failed to fetch meal passes:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch meal passes');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchMealPasses();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const downloadQRCode = (qrCode, messName) => {
    const canvas = document.createElement("canvas");
    const svg = document.querySelector(`#qr-${qrCode}`);
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${messName}-qrcode.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen font-rubik p-6">
        <p className="text-center text-gray-600 dark:text-gray-300">
          Please login to view your meal passes.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen font-rubik p-6">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 font-rubik">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Your Meal Passes
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            Scan these QR codes at your mess for attendance
          </p>
        </div>

        {mealPasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {mealPasses.map((pass) => (
              <Card 
                key={pass._id} 
                className="transform hover:scale-105 transition-all duration-300 shadow-lg dark:bg-gray-800 overflow-hidden"
              >
                <div className="text-center p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {pass.subscriptionId.planId.planName}
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                    {pass.messDetails?.Mess_Name}
                  </p>

                  <div className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-inner mb-6 inline-block relative">
                    <button 
                      onClick={() => downloadQRCode(pass.qrCode, pass.messDetails?.Mess_Name)}
                      className="absolute top-2 left-2 p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                      title="Download QR Code"
                    >
                      <HiDownload className="w-5 h-5" />
                    </button>
                    <div className="bg-white p-2 rounded">
                      <QRCodeSVG 
                        id={`qr-${pass.qrCode}`}
                        value={pass.qrCode}
                        size={200}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400 mb-1">Valid From</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(pass.validFrom).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400 mb-1">Valid Till</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(pass.validTill).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400 mb-1">Plan Type</p>
                      <p className="font-semibold text-gray-900 dark:text-white capitalize">
                        {pass.subscriptionId.planId.mealType}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400 mb-1">Duration</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {pass.subscriptionId.planId.duration}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              No active meal passes found
            </p>
            <Button 
              gradientDuoTone="purpleToBlue"
              onClick={() => navigate('/subscriptions')}
            >
              Subscribe to a Meal Plan
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        )}
      </div>
    </div>
  );
} 
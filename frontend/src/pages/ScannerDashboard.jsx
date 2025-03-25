import { useState, useEffect } from 'react';
import QRScanner from '../components/QRScanner';
import { Card, Button, Table, Select } from 'flowbite-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function ScannerDashboard() {
  const [showScanner, setShowScanner] = useState(false);
  const [todayStats, setTodayStats] = useState({ breakfast: 0, lunch: 0, dinner: 0 });
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return new Date(today.getTime() + (5.5 * 60 * 60 * 1000)).toISOString().split('T')[0];
  });
  const { currentUser } = useSelector(state => state.user);

  const fetchTodayStats = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkin/today-stats/${currentUser._id}`
      );
      setTodayStats(res.data);
    } catch (error) {
      console.error('Failed to fetch today\'s stats:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkin/${currentUser._id}`,
        { params: { date: selectedDate } }
      );
      setAttendanceRecords(res.data);
    } catch (error) {
      console.error('Failed to fetch attendance records:', error);
    }
  };

  const handleAttendanceMarked = () => {
    fetchTodayStats();
    fetchAttendance();
  };

  useEffect(() => {
    if (currentUser?.Login_Role !== 'Mess Owner') return;
    fetchTodayStats();
    fetchAttendance();
  }, [currentUser, selectedDate]);

  if (currentUser?.Login_Role !== 'Mess Owner') {
    return (
      <div className="p-4">
        <p>Access denied. Only mess owners can access this page.</p>
      </div>
    );
  }

  const renderAttendanceRow = (record) => {
    // Safely access nested properties
    const username = record?.userId?.username || 'Unknown User';
    const mealType = record?.mealType || 'N/A';
    const time = record?.createdAt ? new Date(record.createdAt).toLocaleTimeString() : 'N/A';
    const planName = record?.mealPassId?.subscriptionId?.planId?.planName || 'N/A';

    return (
      <Table.Row key={record._id}>
        <Table.Cell>{username}</Table.Cell>
        <Table.Cell className="capitalize">{mealType}</Table.Cell>
        <Table.Cell>{time}</Table.Cell>
        <Table.Cell>{planName}</Table.Cell>
      </Table.Row>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-rubik">
      <h1 className="text-3xl font-bold mb-8 text-center md:text-left text-gray-800 dark:text-white">
        Scanner Dashboard
      </h1>
      
      <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-2">
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Meal Pass Scanner
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Scan student meal passes for check-in
            </p>
          </div>
          <Button 
            gradientDuoTone="purpleToBlue"
            onClick={() => setShowScanner(!showScanner)}
            className="w-full sm:w-auto"
          >
            {showScanner ? 'Close Scanner' : 'Open Scanner'}
          </Button>
        </div>
        
        {showScanner && (
          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-md bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
              <QRScanner onAttendanceMarked={handleAttendanceMarked} className=""/>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="transform hover:scale-105 transition-transform duration-300">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Today's Check-ins
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900 rounded">
              <span className="font-medium">Breakfast</span>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-300">
                {todayStats.breakfast}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900 rounded">
              <span className="font-medium">Lunch</span>
              <span className="text-xl font-bold text-green-600 dark:text-green-300">
                {todayStats.lunch}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-purple-50 dark:bg-purple-900 rounded">
              <span className="font-medium">Dinner</span>
              <span className="text-xl font-bold text-purple-600 dark:text-purple-300">
                {todayStats.dinner}
              </span>
            </div>
          </div>
        </Card>
        
        <Card className="lg:col-span-2 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 sm:mb-0">
              Attendance Records
            </h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 w-full sm:w-auto dark:bg-gray-700"
            />
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <Table hoverable>
              <Table.Head className="bg-gray-50 dark:bg-gray-800">
                <Table.HeadCell className="font-semibold">Student</Table.HeadCell>
                <Table.HeadCell className="font-semibold">Meal Type</Table.HeadCell>
                <Table.HeadCell className="font-semibold">Time</Table.HeadCell>
                <Table.HeadCell className="font-semibold">Plan</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {attendanceRecords.length > 0 ? (
                  attendanceRecords.map(renderAttendanceRow)
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan={4} className="text-center py-8 text-gray-500">
                      No attendance records found for this date
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
} 
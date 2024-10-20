import { useSelector } from 'react-redux';

export default function ThemeProvider({ children }) {
  const { theme } = useSelector((state) => state.theme);
  return (
    <div className={theme}>
      <div className='bg-gray-200 text-gray-800 dark:text-gray-300 dark:bg-[#1E1E2F] dark:border-gray-700 dark:accent-[#5B8CFF] min-h-screen'>
        {children}
      </div>
    </div>
  );
}

import { Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import Details from './Components/Details/ProductDetail';
import MyAds from './Pages/MyAds';
import Layout from './Layout';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="details" element={<Details />} />
        <Route path="myads" element={<MyAds />} />
      </Route>
    </Routes>
  );
};

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import Contact from './components/Contact';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/samples" element={<Layout><Home /></Layout>} />
        <Route path="/limited-stock" element={<Layout><Home /></Layout>} />
        <Route path="/fragrances" element={<Layout><Home /></Layout>} />
        <Route path="/Niche" element={<Layout><Home /></Layout>} />
        <Route path="/Designer" element={<Layout><Home /></Layout>} />
        <Route path="/Middle-Eastern" element={<Layout><Home /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;